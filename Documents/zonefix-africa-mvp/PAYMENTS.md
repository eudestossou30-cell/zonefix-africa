# Paiements réels ZoneFix Africa — Bénin

## Prestataire

Le MVP utilise FedaPay. La documentation FedaPay indique pour le Bénin : MTN Mobile Money, Moov, Celtiis, ainsi que Visa/Mastercard.

## 1. Créer le compte marchand

Créer/valider le compte marchand FedaPay puis récupérer la clé secrète du mode Sandbox.

## 2. Configurer `.env`

```env
MOCK_PAYMENTS=false
FEDAPAY_SECRET_KEY=...
FEDAPAY_ENV=sandbox
FEDAPAY_WEBHOOK_SECRET=...
PUBLIC_FRONTEND_URL=http://localhost:5173
```

## 3. Installer

```bash
npm install
```

Le package officiel Node.js utilisé par le projet est `fedapay`.

## 4. Base de données

```bash
npm run db:push
```

## 5. Tester

```bash
npm run dev
```

Ouvrir le dashboard puis **Payer 5 000 FCFA**.

## 6. Webhook de production

Le webhook doit être accessible publiquement en HTTPS :

```text
https://votre-domaine.tld/api/payments/fedapay/webhook
```

Créer le webhook dans le dashboard FedaPay et copier son secret dans `FEDAPAY_WEBHOOK_SECRET`. Le backend vérifie la signature `X-FEDAPAY-SIGNATURE`.

## Important

Le ZIP contient l'intégration logicielle, mais **les paiements ne deviennent réellement encaissables qu'après configuration et validation du compte marchand FedaPay et remplacement des clés Sandbox par les clés Live**. Ne jamais mettre une clé secrète dans React, Git ou un fichier public.
