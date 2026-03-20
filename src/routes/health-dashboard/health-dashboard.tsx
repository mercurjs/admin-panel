/**
 * Health Dashboard — admin panel extension (Story 8.7).
 *
 * Shows: component health (PG/Redis/MinIO/Mercur), entitlement stats by status,
 * last sync timestamp. Desktop-only view (mobile guard at <1024px).
 */
import { useEffect, useState } from "react"
import {
  Badge,
  Container,
  Heading,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "@lib/client"

// ─── Types ───────────────────────────────────────────────────────────────────

type ServiceProbe = {
  id: string
  name: string
  ok: boolean
  latency_ms: number | null
  error?: string
}

type HealthResponse = {
  updated_at: string
  services: ServiceProbe[]
  entitlement_stats: Record<string, number>
  last_sync_at: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function statusColor(status: string): "green" | "red" | "orange" | "grey" {
  switch (status) {
    case "ACTIVE":
    case "active":
      return "green"
    case "VOIDED":
    case "EXPIRED":
    case "REFUNDED":
      return "red"
    case "REDEEMED":
    case "FULLY_REDEEMED":
      return "grey"
    default:
      return "orange"
  }
}

// ─── Service card ────────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: ServiceProbe }) {
  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-4 flex items-center justify-between">
      <div>
        <Text weight="plus" size="small">{service.name}</Text>
        {service.error && (
          <Text size="xsmall" className="text-ui-fg-error mt-1">{service.error}</Text>
        )}
      </div>
      <div className="flex items-center gap-3">
        {service.latency_ms !== null && (
          <Text size="xsmall" className="text-ui-fg-subtle font-mono">
            {service.latency_ms}ms
          </Text>
        )}
        <Badge color={service.ok ? "green" : "red"} size="xsmall">
          {service.ok ? "OK" : "DOWN"}
        </Badge>
      </div>
    </div>
  )
}

// ─── Entitlement stat card ───────────────────────────────────────────────────

function StatCard({ status, count }: { status: string; count: number }) {
  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-4 text-center">
      <Badge color={statusColor(status)} size="xsmall">
        {status}
      </Badge>
      <div className="mt-2">
        <Text weight="plus" size="xlarge">{count}</Text>
      </div>
    </div>
  )
}

// ─── Mobile guard ────────────────────────────────────────────────────────────

function useMobileGuard(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return isMobile
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function HealthDashboardPage() {
  const isMobile = useMobileGuard()

  const { data, isFetching, error, refetch } = useQuery<HealthResponse>({
    queryKey: ["admin-health"],
    queryFn: () => sdk.client.fetch("/v1/admin/health"),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })

  if (isMobile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Container>
          <div className="px-6 py-8 text-center">
            <Heading level="h2">Użyj desktop</Heading>
            <Text className="text-ui-fg-subtle mt-2">
              Health Dashboard wymaga ekranu o szerokości min. 1024px.
            </Text>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <Container>
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Heading level="h1">Health Dashboard</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Stan komponentów systemu, statystyki entitlementów i ostatnia synchronizacja.
            </Text>
          </div>
          <div className="flex items-center gap-3">
            {data?.updated_at && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                Aktualizacja: {formatTimestamp(data.updated_at)}
              </Text>
            )}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded border border-ui-border-base px-3 py-1 text-xs hover:bg-ui-bg-subtle disabled:opacity-50"
            >
              {isFetching ? "Odświeżam…" : "Odśwież"}
            </button>
          </div>
        </div>
      </Container>

      {error && (
        <div className="rounded border border-ui-border-error bg-ui-bg-error p-4">
          <Text className="text-ui-fg-error">
            Błąd pobierania statusu. Sprawdź, czy jesteś zalogowany jako operator.
          </Text>
        </div>
      )}

      {data && (
        <>
          {/* Services */}
          <Container>
            <div className="px-6 py-4">
              <Text weight="plus" size="small" className="text-ui-fg-subtle uppercase tracking-wide mb-3">
                Komponenty systemu
              </Text>
              <div className="grid grid-cols-2 gap-3">
                {data.services.map((s) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
            </div>
          </Container>

          {/* Entitlement stats */}
          <Container>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <Text weight="plus" size="small" className="text-ui-fg-subtle uppercase tracking-wide">
                  Statystyki entitlementów
                </Text>
                {data.last_sync_at && (
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Ostatni sync: {formatTimestamp(data.last_sync_at)}
                  </Text>
                )}
              </div>
              {Object.keys(data.entitlement_stats).length > 0 ? (
                <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
                  {Object.entries(data.entitlement_stats)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([status, count]) => (
                      <StatCard key={status} status={status} count={count} />
                    ))}
                </div>
              ) : (
                <Text size="small" className="text-ui-fg-subtle">
                  Brak danych o entitlementach.
                </Text>
              )}
            </div>
          </Container>
        </>
      )}
    </div>
  )
}
