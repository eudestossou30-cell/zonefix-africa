import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { signToken, requireAuth, requireRole } from './auth.js';
import { encrypt, decrypt } from './crypto.js';
import { testConnection, collectSnapshot, runSafeAction } from './mikrotik.js';
import { diagnose } from './ai.js';
import { createCheckout, verifyWebhookEvent } from './payments.js';
import path from 'node:path';
import fs from 'node:fs';

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT || 4000);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({
  limit: '2mb',
  verify: (req, _res, buf) => { req.rawBody = Buffer.from(buf); }
}));

const uploadDir = path.resolve('data/uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir, limits: { fileSize: 8 * 1024 * 1024 } });

const userPublic = {
  id: true, firstName: true, lastName: true, email: true,
  phone: true, city: true, district: true, role: true, verified: true
};

async function activeSubscription(userId) {
  return prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: 'desc' }
  });
}

function normalizeUser(user) {
  return user ? {
    id: user.id, firstName: user.firstName, lastName: user.lastName,
    email: user.email, phone: user.phone, city: user.city,
    district: user.district, role: user.role, verified: user.verified
  } : null;
}

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'zonefix-api', time: new Date().toISOString() }));

app.post('/api/auth/register', async (req, res) => {
  const schema = z.object({
    firstName: z.string().min(2), lastName: z.string().min(2),
    email: z.string().email(), phone: z.string().optional(),
    city: z.string().optional(), district: z.string().optional(),
    password: z.string().min(8), role: z.enum(['OWNER', 'TECHNICIAN']).default('OWNER')
  });
  const data = schema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) return res.status(409).json({ error: 'Email déjà utilisé' });

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName, lastName: data.lastName, email: data.email,
      phone: data.phone, city: data.city, district: data.district,
      passwordHash, role: data.role, verified: data.role === 'OWNER'
    },
    select: userPublic
  });

  const sub = await prisma.subscription.create({
    data: {
      userId: user.id,
      amount: 5000,
      status: process.env.MOCK_PAYMENTS === 'true' ? 'ACTIVE' : 'PENDING',
      startedAt: process.env.MOCK_PAYMENTS === 'true' ? new Date() : null,
      expiresAt: process.env.MOCK_PAYMENTS === 'true' ? new Date(Date.now() + 30*24*3600*1000) : null
    }
  });

  res.status(201).json({
    user,
    token: signToken(user),
    subscription: sub
  });
});

app.post('/api/auth/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
  const data = schema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }
  res.json({ user: normalizeUser(user), token: signToken(user) });
});

app.get('/api/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth.sub }, select: userPublic });
  res.json({ user });
});

app.get('/api/dashboard', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth.sub },
    include: {
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
      zones: { include: { mikrotiks: true }, orderBy: { createdAt: 'desc' } },
      interventions: { orderBy: { createdAt: 'desc' }, take: 8, include: { technician: { select: userPublic } } }
    }
  });
  const subscription = user?.subscriptions?.[0] || null;
  res.json({
    user: normalizeUser(user),
    subscription,
    zones: user?.zones || [],
    interventions: user?.interventions || [],
    stats: {
      zones: user?.zones?.length || 0,
      onlineZones: (user?.zones || []).filter(z => z.status === 'ONLINE').length,
      interventions: user?.interventions?.length || 0
    }
  });
});

app.post('/api/payments/checkout', requireAuth, async (req, res) => {
  const schema = z.object({
    type: z.enum(['SUBSCRIPTION', 'INTERVENTION']).default('SUBSCRIPTION'),
    interventionId: z.string().optional(),
    method: z.enum(['all', 'mtn', 'moov', 'celtiis']).default('all')
  });
  const data = schema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.auth.sub } });
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  let amount = 5000;
  let subscriptionId = null;
  let interventionId = null;
  let description = 'Abonnement ZoneFix Africa — 5 000 FCFA';

  if (data.type === 'SUBSCRIPTION') {
    const subscription = await prisma.subscription.create({
      data: { userId: user.id, amount: 5000, status: 'PENDING' }
    });
    subscriptionId = subscription.id;
  } else {
    if (user.role !== 'OWNER') return res.status(403).json({ error: 'Seul le propriétaire peut payer une intervention' });
    const intervention = await prisma.intervention.findFirst({ where: { id: data.interventionId, ownerId: user.id } });
    if (!intervention) return res.status(404).json({ error: 'Intervention introuvable' });
    if (!intervention.price || intervention.price <= 0) return res.status(400).json({ error: 'Le prix de l’intervention doit être défini avant le paiement' });
    amount = intervention.price;
    interventionId = intervention.id;
    description = `Intervention ZoneFix Africa — ${intervention.title}`;
  }

  const payment = await prisma.payment.create({
    data: {
      subscriptionId,
      interventionId,
      amount,
      type: data.type,
      provider: 'FEDAPAY',
      status: 'PENDING',
      reference: `ZF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      method: data.method
    }
  });

  try {
    const checkout = await createCheckout({
      user, amount, description, paymentId: payment.id,
      merchantReference: payment.reference, method: data.method
    });
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { providerTransactionId: String(checkout.transaction.id), metadata: JSON.stringify(checkout.transaction) }
    });
    return res.status(201).json({ payment: updated, checkoutUrl: checkout.url, provider: 'FEDAPAY' });
  } catch (error) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', metadata: JSON.stringify({ error: error?.message }) } });
    if (subscriptionId) await prisma.subscription.update({ where: { id: subscriptionId }, data: { status: 'CANCELED' } });
    return res.status(502).json({ error: error?.message || 'Impossible de créer le paiement FedaPay' });
  }
});

app.get('/api/payments/:id', requireAuth, async (req, res) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: req.params.id,
      OR: [
        { subscription: { userId: req.auth.sub } },
        { intervention: { ownerId: req.auth.sub } }
      ]
    },
    include: { subscription: true, intervention: true }
  });
  if (!payment) return res.status(404).json({ error: 'Paiement introuvable' });
  res.json({ payment });
});

app.post('/api/payments/fedapay/webhook', async (req, res) => {
  try {
    const event = await verifyWebhookEvent(req.rawBody || Buffer.from(JSON.stringify(req.body)), req.headers['x-fedapay-signature']);
    const transaction = event?.entity || event?.data?.object || event?.object || event?.transaction;
    const eventName = event?.name || event?.type || '';
    const approved = eventName === 'transaction.approved' || transaction?.status === 'approved';
    const canceled = eventName === 'transaction.canceled' || eventName === 'transaction.declined' || ['canceled', 'declined'].includes(transaction?.status);
    const metadata = transaction?.custom_metadata || transaction?.metadata || {};
    const paymentId = metadata.paymentId || metadata.payment_id || null;
    const merchantReference = transaction?.merchant_reference || transaction?.reference || null;
    const payment = paymentId
      ? await prisma.payment.findUnique({ where: { id: String(paymentId) }, include: { subscription: true } })
      : merchantReference
        ? await prisma.payment.findUnique({ where: { reference: merchantReference }, include: { subscription: true } })
        : null;
    if (!payment) return res.json({ received: true });
    if (!payment) return res.json({ received: true });

    if (approved && payment.status !== 'PAID') {
      await prisma.$transaction(async tx => {
        await tx.payment.update({ where: { id: payment.id }, data: { status: 'PAID', providerTransactionId: transaction?.id ? String(transaction.id) : payment.providerTransactionId, metadata: JSON.stringify(transaction || event) } });
        if (payment.subscriptionId) {
          const now = new Date();
          const expires = new Date(now); expires.setDate(expires.getDate() + 30);
          await tx.subscription.update({ where: { id: payment.subscriptionId }, data: { status: 'ACTIVE', startedAt: now, expiresAt: expires } });
        }
        if (payment.interventionId) {
          await tx.intervention.update({ where: { id: payment.interventionId }, data: { notes: 'Paiement confirmé par FedaPay.' } });
        }
      });
    } else if (canceled) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', metadata: JSON.stringify(transaction || event) } });
      if (payment.subscriptionId) await prisma.subscription.update({ where: { id: payment.subscriptionId }, data: { status: 'CANCELED' } });
    }
    res.json({ received: true });
  } catch (error) {
    console.error('FedaPay webhook error:', error);
    res.status(400).json({ error: 'Webhook FedaPay invalide' });
  }
});

app.post('/api/payments/demo-activate', requireAuth, async (req, res) => {
  if (process.env.MOCK_PAYMENTS !== 'true') return res.status(410).json({ error: 'Les paiements de démonstration sont désactivés' });
  const now = new Date();
  const expires = new Date(now); expires.setDate(expires.getDate() + 30);
  const subscription = await prisma.subscription.create({
    data: { userId: req.auth.sub, amount: 5000, status: 'ACTIVE', startedAt: now, expiresAt: expires, payments: { create: { amount: 5000, type: 'SUBSCRIPTION', provider: 'DEMO', status: 'PAID', reference: `DEMO-${Date.now()}` } } }
  });
  res.json({ subscription });
});

app.post('/api/zones', requireAuth, async (req, res) => {
  const schema = z.object({
    name: z.string().min(2), city: z.string().min(2),
    district: z.string().optional(), provider: z.string().optional()
  });
  const data = schema.parse(req.body);
  const sub = await activeSubscription(req.auth.sub);
  if (!sub) return res.status(402).json({ error: 'Abonnement ZoneFix actif requis' });

  const zone = await prisma.wifiZone.create({ data: { ...data, ownerId: req.auth.sub } });
  res.status(201).json({ zone });
});

app.post('/api/mikrotiks', requireAuth, async (req, res) => {
  const schema = z.object({
    zoneId: z.string(), name: z.string().min(2), host: z.string().min(1),
    port: z.coerce.number().int().positive().default(8728),
    ssl: z.boolean().default(false), username: z.string().min(1), password: z.string().min(1)
  });
  const data = schema.parse(req.body);
  const zone = await prisma.wifiZone.findFirst({ where: { id: data.zoneId, ownerId: req.auth.sub } });
  if (!zone) return res.status(404).json({ error: 'Wi-Fi Zone introuvable' });
  const mikrotik = await prisma.mikrotik.create({
    data: { zoneId: data.zoneId, name: data.name, host: data.host, port: data.port, ssl: data.ssl, username: data.username, passwordCipher: encrypt(data.password) }
  });
  res.status(201).json({ mikrotik: { ...mikrotik, passwordCipher: undefined } });
});

app.post('/api/mikrotiks/:id/test', requireAuth, async (req, res) => {
  const m = await prisma.mikrotik.findFirst({ where: { id: req.params.id, zone: { ownerId: req.auth.sub } } });
  if (!m) return res.status(404).json({ error: 'MikroTik introuvable' });

  try {
    const result = await testConnection({ host: m.host, port: m.port, username: m.username, password: decrypt(m.passwordCipher) });
    const version = result.resource?.['version'] || null;
    const updated = await prisma.mikrotik.update({ where: { id: m.id }, data: { online: true, lastSeenAt: new Date(), routerVersion: version } });
    res.json({ ok: true, result, mikrotik: { ...updated, passwordCipher: undefined } });
  } catch (error) {
    await prisma.mikrotik.update({ where: { id: m.id }, data: { online: false } });
    res.status(502).json({ ok: false, error: error?.message || 'Connexion MikroTik impossible' });
  }
});

app.get('/api/mikrotiks/:id/health', requireAuth, async (req, res) => {
  const m = await prisma.mikrotik.findFirst({ where: { id: req.params.id, zone: { ownerId: req.auth.sub } } });
  if (!m) return res.status(404).json({ error: 'MikroTik introuvable' });

  try {
    const snapshot = await collectSnapshot({ host: m.host, port: m.port, username: m.username, password: decrypt(m.passwordCipher) });
    const cpu = Number(snapshot.resource?.['cpu-load'] || 0);
    const score = Math.max(20, Math.min(100, 100 - Math.max(0, cpu - 40)));
    await prisma.mikrotik.update({ where: { id: m.id }, data: { online: true, lastSeenAt: new Date(), routerVersion: snapshot.resource?.version || null } });
    await prisma.wifiZone.update({ where: { id: m.zoneId }, data: { healthScore: score, clients: snapshot.clients || 0, status: 'ONLINE' } });
    res.json({ snapshot, healthScore: score });
  } catch (error) {
    await prisma.mikrotik.update({ where: { id: m.id }, data: { online: false } });
    res.status(502).json({ error: error?.message || 'Impossible de récupérer les données MikroTik' });
  }
});

app.post('/api/diagnostics', requireAuth, upload.array('files', 5), async (req, res) => {
  const schema = z.object({ equipment: z.string().min(2), issue: z.string().min(3), zoneId: z.string().optional(), mikrotikId: z.string().optional() });
  const data = schema.parse(req.body);

  let snapshot = {};
  if (data.mikrotikId) {
    const m = await prisma.mikrotik.findFirst({ where: { id: data.mikrotikId, zone: { ownerId: req.auth.sub } } });
    if (m) {
      try { snapshot = await collectSnapshot({ host: m.host, port: m.port, username: m.username, password: decrypt(m.passwordCipher) }); } catch {}
    }
  }

  const ai = await diagnose({ equipment: data.equipment, issue: data.issue, snapshot });
  const diagnostic = await prisma.diagnostic.create({
    data: {
      ownerId: req.auth.sub,
      zoneId: data.zoneId || null,
      mikrotikId: data.mikrotikId || null,
      equipment: data.equipment,
      issue: data.issue,
      status: 'RUNNING',
      summary: ai.summary,
      result: JSON.stringify(ai),
      confidence: ai.confidence,
      attachments: {
        create: (req.files || []).map(f => ({ filename: f.originalname, mimeType: f.mimetype, path: f.path }))
      }
    },
    include: { attachments: true }
  });

  res.status(201).json({ diagnostic, ai });
});

app.post('/api/diagnostics/:id/resolve', requireAuth, async (req, res) => {
  const diagnostic = await prisma.diagnostic.findFirst({ where: { id: req.params.id, ownerId: req.auth.sub } });
  if (!diagnostic) return res.status(404).json({ error: 'Diagnostic introuvable' });
  const updated = await prisma.diagnostic.update({ where: { id: diagnostic.id }, data: { status: 'RESOLVED' } });
  res.json({ diagnostic: updated });
});

app.post('/api/diagnostics/:id/escalate', requireAuth, async (req, res) => {
  const diagnostic = await prisma.diagnostic.findFirst({ where: { id: req.params.id, ownerId: req.auth.sub } });
  if (!diagnostic) return res.status(404).json({ error: 'Diagnostic introuvable' });

  const intervention = await prisma.intervention.create({
    data: {
      ownerId: req.auth.sub,
      diagnosticId: diagnostic.id,
      title: `${diagnostic.equipment} — ${diagnostic.issue}`,
      status: 'NEW'
    }
  });
  await prisma.diagnostic.update({ where: { id: diagnostic.id }, data: { status: 'ESCALATED' } });
  res.status(201).json({ intervention });
});

app.get('/api/interventions', requireAuth, async (req, res) => {
  const where = req.auth.role === 'TECHNICIAN' ? {} : { ownerId: req.auth.sub };
  const items = await prisma.intervention.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: { select: userPublic },
      technician: { select: userPublic },
      diagnostic: true
    }
  });
  res.json({ interventions: items });
});

app.post('/api/interventions/:id/accept', requireAuth, requireRole('TECHNICIAN'), async (req, res) => {
  const sub = await activeSubscription(req.auth.sub);
  if (!sub) return res.status(402).json({ error: 'Abonnement technicien actif requis' });

  const item = await prisma.intervention.findUnique({ where: { id: req.params.id } });
  if (!item || item.status !== 'NEW') return res.status(409).json({ error: 'Demande indisponible' });

  const updated = await prisma.intervention.update({
    where: { id: item.id },
    data: { technicianId: req.auth.sub, status: 'ACCEPTED' }
  });
  res.json({ intervention: updated });
});

app.post('/api/mikrotiks/:id/action', requireAuth, async (req, res) => {
  const schema = z.object({
    type: z.enum(['reboot', 'disable_hotspot_user', 'enable_hotspot_user']),
    id: z.string().optional(),
    confirm: z.literal(true)
  });
  const action = schema.parse(req.body);
  const m = await prisma.mikrotik.findFirst({ where: { id: req.params.id, zone: { ownerId: req.auth.sub } } });
  if (!m) return res.status(404).json({ error: 'MikroTik introuvable' });

  try {
    const result = await runSafeAction(
      { host: m.host, port: m.port, username: m.username, password: decrypt(m.passwordCipher) },
      action
    );
    await prisma.auditLog.create({
      data: { mikrotikId: m.id, userId: req.auth.sub, action: action.type, payload: JSON.stringify({ id: action.id }), result: 'SUCCESS' }
    });
    res.json({ ok: true, result });
  } catch (error) {
    await prisma.auditLog.create({
      data: { mikrotikId: m.id, userId: req.auth.sub, action: action.type, payload: JSON.stringify({ id: action.id }), result: `ERROR: ${error?.message}` }
    });
    res.status(502).json({ ok: false, error: error?.message || 'Action impossible' });
  }
});

app.get('/api/admin/overview', requireAuth, requireRole('ADMIN'), async (_, res) => {
  const [owners, technicians, interventions, payments] = await Promise.all([
    prisma.user.count({ where: { role: 'OWNER' } }),
    prisma.user.count({ where: { role: 'TECHNICIAN' } }),
    prisma.intervention.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } })
  ]);
  res.json({ owners, technicians, interventions, revenue: payments._sum.amount || 0 });
});

app.get('/api/admin/owners', requireAuth, requireRole('ADMIN'), async (_, res) => {
  const owners = await prisma.user.findMany({
    where: { role: 'OWNER' },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, city: true, district: true, verified: true },
    orderBy: { id: 'desc' }
  });
  res.json({ owners });
});

app.get('/api/admin/technicians', requireAuth, requireRole('ADMIN'), async (_, res) => {
  const technicians = await prisma.user.findMany({
    where: { role: 'TECHNICIAN' },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, city: true, district: true, verified: true },
    orderBy: { id: 'desc' }
  });
  res.json({ technicians });
});

app.get('/api/admin/payments', requireAuth, requireRole('ADMIN'), async (_, res) => {
  const payments = await prisma.payment.findMany({
    orderBy: { id: 'desc' },
    take: 100
  });
  res.json({ payments });
});
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof z.ZodError) return res.status(400).json({ error: 'Données invalides', details: err.issues });
  res.status(500).json({ error: 'Erreur serveur' });
});

app.listen(port, () => {
  console.log(`ZoneFix API running on http://localhost:${port}`);
});
