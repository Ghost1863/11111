import { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartActivity } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"

const trackAdminEvent = async (
  eventName: string,
  attributes: Record<string, string | number | boolean> = {}
) => {
  await fetch("/admin/telemetry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventName, attributes }),
  })
}

const TkassaTelemetryPage = () => {
  const [lastEvent, setLastEvent] = useState<string>("none")
  const [isSending, setIsSending] = useState(false)

  const send = async (eventName: string, buttonId: string) => {
    setIsSending(true)

    try {
      await trackAdminEvent(eventName, {
        button_id: buttonId,
      })

      setLastEvent(eventName)
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    void trackAdminEvent("tkassa.admin.page_opened", {
      page: "tkassa-telemetry",
    })
    setLastEvent("tkassa.admin.page_opened")
  }, [])

  return (
    <div className="flex flex-col gap-y-4">
      <Container>
        <div className="flex items-center justify-between">
          <Heading level="h1">T-Kassa Admin Telemetry</Heading>
          <Badge color="blue">admin events</Badge>
        </div>
        <Text className="mt-2 text-ui-fg-subtle">
          Events from this page are sent to OTEL and rendered in Grafana.
        </Text>
        <Text className="mt-2">
          Last sent event: <strong>{lastEvent}</strong>
        </Text>

        <div className="mt-4 flex gap-2">
          <Button
            disabled={isSending}
            onClick={() =>
              void send("tkassa.admin.products_open_clicked", "products-open")
            }
          >
            Track Products Click
          </Button>
          <Button
            variant="secondary"
            disabled={isSending}
            onClick={() =>
              void send("tkassa.admin.orders_open_clicked", "orders-open")
            }
          >
            Track Orders Click
          </Button>
          <Button
            variant="transparent"
            disabled={isSending}
            onClick={() =>
              void send("tkassa.admin.manual_test_clicked", "manual-test")
            }
          >
            Track Test Click
          </Button>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "T-Kassa Telemetry",
  icon: ChartActivity,
})

export default TkassaTelemetryPage
