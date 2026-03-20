/**
 * Vendor management admin page (Story 8.2).
 *
 * Functional vendor list with DataTable + create form + inline actions.
 * Polished dedicated vendor UI deferred to v1.3.0.
 */
import { useState, useCallback } from "react"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
} from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "@lib/client"

// ─── Types ───────────────────────────────────────────────────────────────────

type VendorAdminView = {
  id: string
  instance_id: string
  name: string
  status: string
  created_at: string
  updated_at: string
  market_id?: string
  market_name?: string
}

type VendorsResponse = {
  data: { vendors: VendorAdminView[] }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatShortDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—"
  const d = new Date(isoDate)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

function statusColor(status: string): "green" | "red" | "orange" | "grey" {
  switch (status) {
    case "active":
    case "onboarded":
      return "green"
    case "locked":
      return "red"
    case "inactive":
      return "grey"
    default:
      return "orange"
  }
}

// ─── Create vendor form ──────────────────────────────────────────────────────

function CreateVendorForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("")
  const [instanceId, setInstanceId] = useState("")
  const [marketId, setMarketId] = useState("")
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/v1/admin/vendors", {
        method: "POST",
        body: { name, instance_id: instanceId, market_id: marketId },
      }),
    onSuccess: () => {
      setName("")
      setInstanceId("")
      setMarketId("")
      setOpen(false)
      onCreated()
    },
  })

  if (!open) {
    return (
      <Button variant="primary" size="small" onClick={() => setOpen(true)}>
        Dodaj vendora
      </Button>
    )
  }

  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4 space-y-3">
      <Text weight="plus" size="small">Nowy vendor</Text>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="vendor-name" size="xsmall">Nazwa</Label>
          <Input
            id="vendor-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. City Beauty"
            size="small"
          />
        </div>
        <div>
          <Label htmlFor="vendor-instance" size="xsmall">Instance ID</Label>
          <Input
            id="vendor-instance"
            value={instanceId}
            onChange={(e) => setInstanceId(e.target.value)}
            placeholder="np. gp-dev"
            size="small"
          />
        </div>
        <div>
          <Label htmlFor="vendor-market" size="xsmall">Market ID</Label>
          <Input
            id="vendor-market"
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
            placeholder="UUID marketu"
            size="small"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="small"
          onClick={() => mutation.mutate()}
          disabled={!name || !instanceId || !marketId || mutation.isPending}
        >
          {mutation.isPending ? "Tworzę…" : "Utwórz"}
        </Button>
        <Button variant="secondary" size="small" onClick={() => setOpen(false)}>
          Anuluj
        </Button>
      </div>
      {mutation.isError && (
        <Text size="xsmall" className="text-ui-fg-error">
          Błąd tworzenia vendora. Sprawdź dane i spróbuj ponownie.
        </Text>
      )}
    </div>
  )
}

// ─── Vendor row ──────────────────────────────────────────────────────────────

function VendorRow({ vendor }: { vendor: VendorAdminView }) {
  return (
    <tr className="border-b border-ui-border-base text-sm">
      <td className="py-2 px-3 font-medium">{vendor.name}</td>
      <td className="py-2 px-3">
        <Badge color={statusColor(vendor.status)} size="xsmall">
          {vendor.status}
        </Badge>
      </td>
      <td className="py-2 px-3 text-ui-fg-subtle">{vendor.market_name ?? "—"}</td>
      <td className="py-2 px-3 font-mono text-xs text-ui-fg-subtle" title={vendor.id}>
        {vendor.id.slice(0, 8)}…
      </td>
      <td className="py-2 px-3 text-ui-fg-subtle">{formatShortDate(vendor.created_at)}</td>
    </tr>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function VendorsPage() {
  const queryClient = useQueryClient()

  const { data, isFetching, error } = useQuery<VendorsResponse>({
    queryKey: ["admin-vendors"],
    queryFn: () => sdk.client.fetch("/v1/admin/vendors"),
    staleTime: 30_000,
  })

  const vendors = data?.data?.vendors ?? []

  const handleCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-vendors"] })
  }, [queryClient])

  return (
    <div className="flex flex-col gap-6 p-6">
      <Container>
        <div className="px-6 py-4">
          <Heading level="h1">Zarządzanie vendorami</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Lista vendorów z przypisaniem do marketów. Twórz nowych vendorów i zarządzaj ich statusem.
          </Text>
        </div>

        <div className="px-6 pb-4">
          <CreateVendorForm onCreated={handleCreated} />
        </div>
      </Container>

      <Container>
        <div className="px-6 py-4">
          {isFetching && (
            <Text className="text-ui-fg-subtle">Ładuję vendorów…</Text>
          )}

          {!isFetching && error && (
            <div className="rounded border border-ui-border-error bg-ui-bg-error p-4">
              <Text className="text-ui-fg-error">
                Błąd ładowania vendorów. Sprawdź, czy jesteś zalogowany jako operator.
              </Text>
            </div>
          )}

          {!isFetching && !error && vendors.length === 0 && (
            <Text className="text-ui-fg-subtle">Brak vendorów w systemie.</Text>
          )}

          {!isFetching && !error && vendors.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-ui-border-strong text-xs text-ui-fg-subtle uppercase tracking-wide">
                    <th className="py-2 px-3">Nazwa</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Market</th>
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Utworzono</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <VendorRow key={`${v.id}-${v.market_id}`} vendor={v} />
                  ))}
                </tbody>
              </table>
              <Text size="xsmall" className="text-ui-fg-subtle mt-3">
                {vendors.length} vendor{vendors.length === 1 ? "" : "ów"}
              </Text>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
