# `@gorgo/medusa-payment-tkassa` example

Examples for the [@gorgo/medusa-payment-tkassa](https://www.npmjs.com/package/@gorgo/medusa-payment-tkassa) plugin.

## Prerequisites

- All the [common prerequisites](../README.md#prerequisites).
- A [T-Kassa](https://www.tbank.ru/kassa/) account, a shop identifier `TerminalKey` and a secret `Password`.

## Configuration

Set up environment variables for [`medusa`](./medusa):

```
cd medusa
cp .env.template .env
# and configure your own `TKASSA_TERMINAL_KEY` and `TKASSA_PASSWORD` inside .env
```

## Installation & Development

Follow the [common instractions](../README.md#installation-development).

## Observability (Prometheus + Grafana)

This example includes an observability stack based on OpenTelemetry:

- Medusa exports traces via OTLP
- OpenTelemetry Collector receives traces and generates span metrics
- Prometheus scrapes Collector metrics
- Grafana visualizes metrics and traces

### 1. Start observability services

```bash
cd observability
docker compose up -d
```

Services:

- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- OTel Collector OTLP HTTP endpoint: http://localhost:4318

### 2. Enable telemetry in Medusa

In `medusa/.env`:

```env
OTEL_ENABLED=true
OTEL_SERVICE_NAME=medusa-payment-tkassa-example
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
```

Then run Medusa with telemetry:

```bash
cd ../medusa
yarn
yarn dev:otel
```

### 3. Open Grafana dashboards

The stack auto-provisions data sources:

- Prometheus data source (metrics)
- Tempo data source (traces)
