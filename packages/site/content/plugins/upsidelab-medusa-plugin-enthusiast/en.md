---
locale: en
---

# Medusa Enthusiast Plugin

A Medusa plugin that integrates with Enthusiast.

## Prerequisite

1. Access to Enthusiast instance
2. Enthusiast with configured Medusa integration [Docs](https://upsidelab.io/tools/enthusiast/integrations/medusa)
3. Medusa v2.x
4. Node.js >= 20

## Installation

Install the plugin in your Medusa project:

```bash
npm install @upsidelab/medusa-plugin-enthusiast
```

## Configuration

### Environment Variables

Set you .env file in project root directory:

```dotenv
ENTHUSIAST_API_URL=http://localhost:10000
ENTHUSIAST_WS_URL=ws://localhost:10000
ENTHUSIAST_SERVICE_ACCOUNT_TOKEN=<generated-service-account-token>
ENTHUSIAST_INTEGRATION_NAME=Medusa
ENTHUSIAST_MEDUSA_BACKEND_URL=http://host.docker.internal:9000
ENTHUSIAST_MEDUSA_ADMIN_URL=http://localhost:9000
```

- `ENTHUSIAST_API_URL`: Your Enthusiast instance base API url.
- `ENTHUSIAST_WS_URL`: Your Enthusiast instance base WS url.
- `ENTHUSIAST_SERVICE_ACCOUNT_TOKEN`: Your Enthusiast admin service account's token.
- `ENTHUSIAST_INTEGRATION_NAME`: Your Enthusiast instance Medusa integration name.
- `ENTHUSIAST_MEDUSA_BACKEND_URL(Optional)`: Your medusa backend url, where Enthusiast can send request to (default is set to `http://host.docker.internal:9000` for local docker development or admin.backendUrl is set)
- `ENTHUSIAST_MEDUSA_ADMIN_URL(Optional)`: Your medusa admin url (default is set to `http://localhost:9000`)

### Enable plugin in Medusa

Add below entry to your plugins array:

#### medusa-config.ts

```typescript
{
  resolve: "@upsidelab/medusa-plugin-enthusiast",
  options: {
        enthusiastApiUrl: process.env.ENTHUSIAST_API_URL,
        enthusiastWSUrl: process.env.ENTHUSIAST_WS_URL,
        enthusiastServiceAccountToken: process.env.ENTHUSIAST_SERVICE_ACCOUNT_TOKEN,
        enthusiastMedusaIntegrationName: process.env.ENTHUSIAST_INTEGRATION_NAME,
        medusaBackendUrl: process.env.ENTHUSIAST_MEDUSA_BACKEND_URL,
        medusaAdminUrl: process.env.ENTHUSIAST_MEDUSA_ADMIN_URL,
      }
}
```

### Run Database Migrations

After installing and configuring the plugin, run database migrations to create the required tables:

```bash
npx medusa db:migrate
```

## Generating service account key

Run command on your Enthusiast instance or go to `Manage -> Service accounts` in Enthusiast to generate Admin permission service account token.
Command:

```bash
python manage.py createadminserviceaccount -n <name of your integration>
```

## Usage

Once installed and configured, you can access the Enthusiast plugin in your Medusa Admin:

- Main Enthusiast Page: Navigate to the "Enthusiast" section in the admin sidebar
- Settings: Go to Settings -> Enthusiast to manage datasets and configurations
