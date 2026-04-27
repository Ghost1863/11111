import os from "os"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

type Primitive = string | number | boolean | null | undefined

type TelemetryBody = {
  eventName?: string
  type?: string
  attributes?: Record<string, Primitive>
}

const isTelemetryEnabled = () => {
  return process.env.TKASSA_TELEMETRY_ENABLED !== "false"
}

const getMachineId = () => {
  if (process.env.TKASSA_MACHINE_ID) {
    return process.env.TKASSA_MACHINE_ID
  }

  const configDir = path.join(os.homedir(), ".config", "tkassa-telemetry")
  const configPath = path.join(configDir, "config.json")

  try {
    if (fs.existsSync(configPath)) {
      const existing = JSON.parse(fs.readFileSync(configPath, "utf-8"))
      if (existing.machine_id) {
        return existing.machine_id
      }
    }

    fs.mkdirSync(configDir, { recursive: true })
    const machineId = randomUUID()
    fs.writeFileSync(configPath, JSON.stringify({ machine_id: machineId }, null, 2))
    return machineId
  } catch {
    return randomUUID()
  }
}

const getPackageVersion = (pkg: string) => {
  try {
    return require(`${pkg}/package.json`).version
  } catch {
    return "unknown"
  }
}

const getFeatureFlags = () => {
  return (process.env.MEDUSA_FEATURE_FLAGS || "")
    .split(",")
    .map((flag) => flag.trim())
    .filter(Boolean)
}

const isRunningInDocker = () => {
  try {
    return fs.existsSync("/.dockerenv")
  } catch {
    return false
  }
}

const toOtlpValue = (value: Primitive) => {
  if (typeof value === "boolean") {
    return { boolValue: value }
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return { intValue: value }
    }

    return { doubleValue: value }
  }

  return { stringValue: value == null ? "" : String(value) }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  if (!isTelemetryEnabled()) {
    return res.status(202).json({ ok: false, skipped: true })
  }

  const body = (req.body || {}) as TelemetryBody

  if (!body.eventName) {
    return res.status(400).json({ error: "eventName is required" })
  }

  const endpoint =
    process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ||
    process.env.OTEL_CUSTOM_EVENTS_ENDPOINT ||
    "https://telemetry.gorgojs.com/batch"

  const serviceName =
    process.env.OTEL_SERVICE_NAME || "medusa-payment-tkassa-admin"

  const attributes = Object.entries(body.attributes || {}).map(([key, value]) => ({
    key,
    value: toOtlpValue(value),
  }))

  const eventTimestamp = new Date().toISOString()
  const eventId = `te_${randomUUID()}`
  const eventType = body.type || body.eventName
  const envelope = {
    id: eventId,
    type: eventType,
    properties: body.attributes || {},
    timestamp: eventTimestamp,
    machine_id: getMachineId(),
    os_info: {
      node_version: process.version,
      platform: os.platform(),
      release: os.release(),
      cpus: os.cpus()?.[0]?.model || "unknown",
      is_ci: Boolean(process.env.CI),
      ci_name: process.env.GITHUB_ACTIONS
        ? "github_actions"
        : process.env.GITLAB_CI
          ? "gitlab_ci"
          : process.env.CI
            ? "ci"
            : null,
      arch: os.arch(),
      docker: isRunningInDocker(),
      term_program: process.env.TERM_PROGRAM,
    },
    medusa_version: getPackageVersion("@medusajs/medusa"),
    cli_version: getPackageVersion("@medusajs/cli"),
    feature_flags: getFeatureFlags(),
    modules: [],
    plugins: [],
  }

  const payload = {
    resourceLogs: [
      {
        resource: {
          attributes: [
            { key: "service.name", value: { stringValue: serviceName } },
            { key: "host.name", value: { stringValue: os.hostname() } },
            { key: "app.layer", value: { stringValue: "admin" } },
          ],
        },
        scopeLogs: [
          {
            scope: { name: "tkassa.admin", version: "1.0.0" },
            logRecords: [
              {
                timeUnixNano: `${Date.now()}000000`,
                severityNumber: 9,
                severityText: "INFO",
                body: { stringValue: body.eventName },
                attributes: [
                  { key: "event.name", value: { stringValue: body.eventName } },
                  { key: "event.source", value: { stringValue: "admin.ui" } },
                  { key: "node.env", value: { stringValue: process.env.NODE_ENV || "development" } },
                  { key: "telemetry.id", value: { stringValue: envelope.id } },
                  { key: "telemetry.type", value: { stringValue: envelope.type } },
                  { key: "telemetry.timestamp", value: { stringValue: envelope.timestamp } },
                  { key: "telemetry.machine_id", value: { stringValue: envelope.machine_id } },
                  { key: "telemetry.medusa_version", value: { stringValue: envelope.medusa_version } },
                  { key: "telemetry.cli_version", value: { stringValue: envelope.cli_version } },
                  { key: "telemetry.os.node_version", value: { stringValue: envelope.os_info.node_version } },
                  { key: "telemetry.os.platform", value: { stringValue: envelope.os_info.platform } },
                  { key: "telemetry.os.release", value: { stringValue: envelope.os_info.release } },
                  { key: "telemetry.os.arch", value: { stringValue: envelope.os_info.arch } },
                  { key: "telemetry.os.cpus", value: { stringValue: envelope.os_info.cpus } },
                  { key: "telemetry.os.docker", value: { boolValue: envelope.os_info.docker } },
                  { key: "telemetry.os.is_ci", value: { boolValue: envelope.os_info.is_ci } },
                  { key: "telemetry.payload", value: { stringValue: JSON.stringify(envelope) } },
                  ...attributes,
                ],
              },
            ],
          },
        ],
      },
    ],
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const details = await response.text().catch(() => "")
      return res.status(502).json({
        error: "collector rejected event",
        details,
      })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    return res.status(502).json({
      error: "failed to send event",
      details: String(error),
    })
  }
}
