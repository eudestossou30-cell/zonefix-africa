import { FedaPay, Customer, Transaction, Webhook } from 'fedapay';

function configured() {
  if (!process.env.FEDAPAY_SECRET_KEY) throw new Error('FEDAPAY_SECRET_KEY manquante dans .env');
  FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
  FedaPay.setEnvironment(process.env.FEDAPAY_ENV === 'live' ? 'live' : 'sandbox');
}

const modeMap = { mtn: 'mtn_open', moov: 'moov', celtiis: 'sbin' };

export async function createCheckout({ user, amount, description, paymentId, merchantReference, method = 'all' }) {
  configured();
  const phone = (user.phone || '').replace(/\s+/g, '');
  const customer = await Customer.create({
    firstname: user.firstName,
    lastname: user.lastName,
    email: user.email,
    ...(phone ? { phone_number: { number: phone.replace(/^\+229/, ''), country: 'BJ' } } : {})
  });

  const frontend = process.env.PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
  const params = {
    description,
    amount,
    currency: { iso: 'XOF' },
    callback_url: `${frontend}/payment/result?payment=${encodeURIComponent(paymentId)}`,
    customer: { id: customer.id },
    merchant_reference: merchantReference,
    custom_metadata: { paymentId, type: 'ZONEFIX' }
  };
  if (method !== 'all') params.mode = modeMap[method] || method;

  const transaction = await Transaction.create(params);
  const token = await transaction.generateToken();
  return { transaction, url: token.url, token: token.token };
}

export async function verifyWebhookEvent(rawBody, signature) {
  if (!process.env.FEDAPAY_WEBHOOK_SECRET) throw new Error('FEDAPAY_WEBHOOK_SECRET manquante dans .env');
  if (!signature) throw new Error('Signature FedaPay absente');
  configured();
  return Webhook.constructEvent(rawBody, signature, process.env.FEDAPAY_WEBHOOK_SECRET);
}
