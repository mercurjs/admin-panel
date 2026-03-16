import { useTranslation } from "react-i18next";

import type { Filter } from "@components/table/data-table";

import { useSalesChannels } from "@hooks/api/sales-channels";
import { useSellers } from "@hooks/api/sellers";

export const useOrderSetsTableFilters = (): Filter[] => {
  const { t } = useTranslation();

  const { sales_channels } = useSalesChannels({
    limit: 1000,
    fields: "id,name",
  });

  const { sellers } = useSellers({
    limit: 1000,
    fields: "id,name",
  });

  let filters: Filter[] = [];

  if (sellers) {
    const vendorFilter: Filter = {
      key: "seller_id",
      label: t("fields.vendor"),
      type: "select",
      options: sellers.map((s) => ({
        label: s.name,
        value: s.id,
      })),
      multiple: true,
      searchable: true,
    };

    filters = [...filters, vendorFilter];
  }

  const paymentStatusFilter: Filter = {
    key: "payment_status",
    label: t("orders.payment.statusLabel"),
    type: "select",
    multiple: true,
    options: [
      {
        label: t("orders.payment.status.notPaid"),
        value: "not_paid",
      },
      {
        label: t("orders.payment.status.awaiting"),
        value: "awaiting",
      },
      {
        label: t("orders.payment.status.captured"),
        value: "completed",
      },
      {
        label: t("orders.payment.status.authorized"),
        value: "authorized",
      },
      {
        label: t("orders.payment.status.partiallyAuthorized"),
        value: "partially_authorized",
      },
      {
        label: t("orders.payment.status.partiallyCaptured"),
        value: "partially_captured",
      },
      {
        label: t("orders.payment.status.refunded"),
        value: "refunded",
      },
      {
        label: t("orders.payment.status.partiallyRefunded"),
        value: "partially_refunded",
      },
      {
        label: t("orders.payment.status.canceled"),
        value: "canceled",
      },
      {
        label: t("orders.payment.status.requiresAction"),
        value: "requires_action",
      },
    ],
  };

  // Note: Fulfillment status is a computed field, so it's filtered post-query on the backend
  // by checking individual orders within each order set
  const fulfillmentStatusFilter: Filter = {
    key: "fulfillment_status",
    label: t("orders.fulfillment.statusLabel"),
    type: "select",
    multiple: true,
    options: [
      {
        label: t("orders.fulfillment.status.notFulfilled"),
        value: "not_fulfilled",
      },
      {
        label: t("orders.fulfillment.status.fulfilled"),
        value: "fulfilled",
      },
      {
        label: t("orders.fulfillment.status.partiallyFulfilled"),
        value: "partially_fulfilled",
      },
      {
        label: t("orders.fulfillment.status.shipped"),
        value: "shipped",
      },
      {
        label: t("orders.fulfillment.status.partiallyShipped"),
        value: "partially_shipped",
      },
      {
        label: t("orders.fulfillment.status.delivered"),
        value: "delivered",
      },
      {
        label: t("orders.fulfillment.status.partiallyDelivered"),
        value: "partially_delivered",
      },
      {
        label: t("orders.fulfillment.status.returned"),
        value: "returned",
      },
      {
        label: t("orders.fulfillment.status.partiallyReturned"),
        value: "partially_returned",
      },
      {
        label: t("orders.fulfillment.status.canceled"),
        value: "canceled",
      },
      {
        label: t("orders.fulfillment.status.requiresAction"),
        value: "requires_action",
      },
    ],
  };

  filters = [...filters, paymentStatusFilter, fulfillmentStatusFilter];

  if (sales_channels) {
    const salesChannelFilter: Filter = {
      key: "sales_channel_id",
      label: t("fields.salesChannel"),
      type: "select",
      multiple: true,
      searchable: true,
      options: sales_channels.map((s) => ({
        label: s.name,
        value: s.id,
      })),
    };

    filters = [...filters, salesChannelFilter];
  }

  const dateFilters: Filter[] = [
    { label: "Created At", key: "created_at" },
    { label: "Updated At", key: "updated_at" },
  ].map((f) => ({
    key: f.key,
    label: f.label,
    type: "date",
  }));

  filters = [...filters, ...dateFilters];

  return filters;
};
