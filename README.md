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

## Containerize

```
cd server
docker build -t johnnyoshika/fireship-stripe-server .
```

Test the container (for testing, remove `service-account.json` from `.dockerignore` when building the image so it appears in our container)

```
docker run --rm -d -p 3333:3333 --name fireship-stripe-server \
  -e WEBAPP_URL=http://localhost:3000 \
  -e STRIPE_SECRET={redacted} \
  -e STRIPE_WEBHOOK_SECRET={redacted} \
  -e GOOGLE_APPLICATION_CREDENTIALS=/usr/server/service-account.json \
  johnnyoshika/fireship-stripe-server
```

## Deploy to Cloud Run

### Build the container

```
cd server
gcloud config set project <PROJECT_ID>
gcloud builds submit --tag gcr.io/<PROJECT_ID>/fireship-stripe-server
```

### Deploy to Cloud Run

Exclude `GOOGLE_APPLICATION_CREDENTIALS` env variable, as it will be added automatically by Google Cloud and assigned to the Compute Engine default service account. To change that default (i.e. to change the runtime service account), use `--service-account=example@myproject.iam.gserviceaccount.com`.

_Copied from Google Cloud Console's `SHOW COMMAND LINE` output. Tried it in Cloud shell but it resulted in an error._

```
gcloud run deploy fireship-stripe-server \
--image=gcr.io/fireship-stripe-0/fireship-stripe-server@sha256:{digest} \
--allow-unauthenticated \
--set-env-vars=WEBAPP_URL=http://localhost:3000,STRIPE_SECRET={redacted},STRIPE_WEBHOOK_SECRET={redacted} \
--no-use-http2 \
--cpu-throttling \
--execution-environment=gen1 \
--platform=managed \
--region=us-central1 \
--project=<PROJECT_ID>
```
