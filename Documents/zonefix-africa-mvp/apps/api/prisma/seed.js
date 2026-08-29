import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ZoneFix123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zonefix.africa' },
    update: {},
    create: {
      firstName: 'ZoneFix',
      lastName: 'Admin',
      email: 'admin@zonefix.africa',
      phone: '+22900000000',
      city: 'Cotonou',
      district: 'Centre',
      passwordHash,
      role: 'ADMIN',
      verified: true
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: 'demo@zonefix.africa' },
    update: {},
    create: {
      firstName: 'Gilles',
      lastName: 'Christ',
      email: 'demo@zonefix.africa',
      phone: '+22901020304',
      city: 'Cotonou',
      district: 'Akpakpa',
      passwordHash,
      role: 'OWNER',
      verified: true
    }
  });

  let subscription = await prisma.subscription.findFirst({ where: { userId: owner.id } });
  if (!subscription) {
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + 1);
    subscription = await prisma.subscription.create({
      data: {
        userId: owner.id,
        amount: 5000,
        status: 'ACTIVE',
        startedAt: now,
        expiresAt: expires
      }
    });
  }

  let zone = await prisma.wifiZone.findFirst({ where: { ownerId: owner.id } });
  if (!zone) {
    zone = await prisma.wifiZone.create({
      data: {
        ownerId: owner.id,
        name: 'WiFi Zone Larios',
        city: 'Cotonou',
        district: 'Akpakpa',
        provider: 'Starlink',
        clients: 37,
        healthScore: 92,
        status: 'ONLINE'
      }
    });
  }

  console.log('Seed OK');
  console.log('Admin: admin@zonefix.africa / ZoneFix123!');
  console.log('Demo owner: demo@zonefix.africa / ZoneFix123!');
}

main().finally(() => prisma.$disconnect());
