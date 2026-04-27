const os = require("os")

function isTelemetryEnabled(): boolean {
	return process.env.TKASSA_TELEMETRY_ENABLED !== "false"
}

function getServiceName(): string {
	return process.env.OTEL_SERVICE_NAME || "medusa-payment-tkassa-example"
}

function trackCollectorStartupEvent(): void {
	if (!isTelemetryEnabled()) {
		return
	}

	if (process.env.OTEL_CUSTOM_EVENTS_ENABLED === "false") {
		return
	}

	const endpoint =
		process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ||
		process.env.OTEL_CUSTOM_EVENTS_ENDPOINT ||
		"https://telemetry.gorgojs.com/batch"

	const serviceName = getServiceName()
	const nowNs = `${Date.now()}000000`

	const payload = {
		resourceLogs: [
			{
				resource: {
					attributes: [
						{ key: "service.name", value: { stringValue: serviceName } },
						{ key: "host.name", value: { stringValue: os.hostname() } },
					],
				},
				scopeLogs: [
					{
						scope: { name: "tkassa.startup", version: "1.0.0" },
						logRecords: [
							{
								timeUnixNano: nowNs,
								severityNumber: 9,
								severityText: "INFO",
								body: { stringValue: "tkassa.app.started" },
								attributes: [
									{ key: "event.name", value: { stringValue: "tkassa.app.started" } },
									{ key: "event.source", value: { stringValue: "collector" } },
									{ key: "process.pid", value: { intValue: process.pid } },
									{ key: "node.env", value: { stringValue: process.env.NODE_ENV || "development" } },
								],
							},
						],
					},
				],
			},
		],
	}

	void fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	}).catch((e) => {
		console.warn("Collector startup event failed:", e)
	})
}

export function register() {
	if (!isTelemetryEnabled()) {
		return
	}

	trackCollectorStartupEvent()
}
