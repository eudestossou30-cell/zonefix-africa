# ZONEFIX AFRICA — MVP

Plateforme mobile-first de diagnostic et maintenance des Wi‑Fi Zones.

## Stack

- Frontend: React + Vite + React Router + Lucide
- Backend: Node.js + Express
- Base de données: SQLite + Prisma
- Authentification: JWT + bcrypt
- IA: OpenAI Responses API avec moteur de secours local
- MikroTik: adaptateur RouterOS API
- Uploads: Multer
- Design: dark navy, bleu électrique, cyan, cartes vitrées — inspiré de la maquette fournie.

## Démarrage rapide

Pré-requis: Node.js 20+ et npm.

```bash
npm install
cp apps/api/.env.example apps/api/.env
npm run db:push
npm run db:seed
npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:4000

Compte de démonstration:
- Email: admin@zonefix.africa
- Mot de passe: ZoneFix123!

## IA

Pour activer l'IA distante, renseigner `OPENAI_API_KEY` dans `apps/api/.env`.
Le backend utilise l'API Responses et le modèle configuré dans `OPENAI_MODEL`.

Sans clé, ZoneFix utilise un moteur de diagnostic local pour permettre au MVP de fonctionner immédiatement.

## MikroTik

Le connecteur attend un accès RouterOS API depuis le serveur ZoneFix.

Recommandation de production:
1. utiliser API-SSL/TLS;
2. créer un compte MikroTik dédié;
3. accorder uniquement les permissions nécessaires;
4. ne jamais exposer WinBox/API à tout Internet;
5. chiffrer les identifiants côté serveur;
6. journaliser toute action distante.

Le MVP ne permet pas d'exécuter une commande RouterOS arbitraire. Les actions distantes sont limitées à une liste blanche.

## Paiements Mobile Money — Bénin

Le MVP intègre maintenant **FedaPay** côté serveur pour les paiements réels en XOF. FedaPay indique actuellement prendre en charge au Bénin **MTN Mobile Money, Moov Money et Celtiis**, ainsi que les cartes bancaires. Les paiements sans redirection sont également documentés pour ces trois moyens.

Le parcours ZoneFix est :

```text
Propriétaire
  ↓
5 000 FCFA
  ↓
Choix MTN / Moov / Celtiis
  ↓
Checkout FedaPay
  ↓
Paiement Mobile Money
  ↓
Webhook FedaPay signé
  ↓
Payment = PAID
  ↓
Abonnement = ACTIVE pendant 30 jours
```

### Configuration

Dans `apps/api/.env` :

```env
MOCK_PAYMENTS=false
FEDAPAY_SECRET_KEY=VOTRE_CLE_SECRETE
FEDAPAY_ENV=sandbox
FEDAPAY_WEBHOOK_SECRET=VOTRE_SECRET_WEBHOOK
PUBLIC_FRONTEND_URL=http://localhost:5173
```

Pour la production, utiliser les clés **live** et une URL publique HTTPS. La clé secrète FedaPay doit rester uniquement sur le serveur.

### Webhook

Configurer dans le tableau de bord FedaPay l'URL :

```text
https://VOTRE-DOMAINE/api/payments/fedapay/webhook
```

Le serveur vérifie `X-FEDAPAY-SIGNATURE` avant d'activer un abonnement.

### Paiement d'une intervention

Le même module accepte `INTERVENTION` avec le prix de l'intervention. Le paiement reste séparé de l'abonnement ZoneFix.

## Structure

```text
zonefix-africa-mvp/
  apps/
    web/
    api/
  docker-compose.yml
  package.json
```
