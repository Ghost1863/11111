"use client"

type EventAttributeValue = string | number | boolean | null | undefined

type EventAttributes = Record<string, EventAttributeValue>

export function trackUiEvent(eventName: string, attributes: EventAttributes = {}) {
  if (process.env.NEXT_PUBLIC_TKASSA_TELEMETRY_ENABLED === "false") {
    return
  }

  void fetch("/api/track-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventName, attributes }),
  }).catch(() => {
    // Never block checkout flow because of telemetry delivery issues.
  })
}
