# Observability Stack (Collector + Loki + Grafana)

This folder contains a local observability stack for the `payment-tkassa` example.

## Services

- OTel Collector: `4317` (gRPC), `4318` (HTTP)
- Grafana: `3001` (`admin` / `admin`)
- Loki: `3100`

## Start

```bash
cd ./observability

docker-compose up -d
```

## Stop

```bash
docker-compose down
```

## Verify

```bash
docker-compose ps
```

## Send telemetry from Medusa

Set in `../medusa/.env`:

```env
OTEL_CUSTOM_EVENTS_ENABLED=true
OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=http://localhost:4318/v1/logs
```

Run Medusa:

```bash
cd ../medusa
yarn
yarn dev
```

## Centralized custom events endpoint

Use OTel Collector as the single ingest endpoint for custom events (OTLP logs):

- HTTP endpoint: `http://localhost:4318/v1/logs`
- gRPC endpoint: `localhost:4317`

Custom events sent as OTLP logs are stored in Loki and can be explored in Grafana (Loki datasource).
