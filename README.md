# Fireship Stripe Course

Course: https://fireship.io/courses/stripe-js/

## Getting Started

```bash
cd app && npm ci && cp .env.example .env
cd server && npm ci && cp .env.example .env
```

Add Stripe product and add 2 pricing plans:

- Monthly recurring for $25
- Quarterly recurring for $50

Generate new private key from `Firebase Project Settings` -> `Service Accounts` -> `Firebase Admin SDK`. Store that file in `server/service-account.json`.
Add missing info to .env files.

```bash
cd npm run server
cd npm run app
```
