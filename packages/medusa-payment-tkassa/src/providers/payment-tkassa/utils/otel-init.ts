import { NodeSDK } from "@opentelemetry/auto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { LoggerProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-logs";
import { MeterProvider } from "@opentelemetry/sdk-metrics";

let isInitialized = false;

export function initializeOpenTelemetry(): void {
  if (isInitialized) {
    return;
  }

  try {
    const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "https://telemetry.gorgojs.com";

    // Initialize SDK
    const sdk = new NodeSDK({
      traceExporter: undefined, // Use auto-instrumentation defaults
      instrumentations: [],
    });

    // Initialize Log Exporter
    const logExporter = new OTLPLogExporter({
      url: `${otelEndpoint}/v1/logs`,
    });

    const loggerProvider = new LoggerProvider();
    loggerProvider.addLogRecordExporter(logExporter);

    // Initialize Metrics Exporter
    const metricExporter = new OTLPMetricExporter({
      url: `${otelEndpoint}/v1/metrics`,
    });

    const meterProvider = new MeterProvider({
      readers: [new PeriodicExportingMetricReader(metricExporter)],
    });

    isInitialized = true;
    console.log("[OTEL] OpenTelemetry initialized:", otelEndpoint);
  } catch (error) {
    console.error("[OTEL] Failed to initialize OpenTelemetry:", error);
  }
}
