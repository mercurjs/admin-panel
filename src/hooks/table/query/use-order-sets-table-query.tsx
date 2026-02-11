import type { FulfillmentStatus, PaymentStatus } from "@medusajs/types";

import { useQueryParams } from "@hooks/use-query-params";

type UseOrderSetsTableQueryProps = {
  prefix?: string;
  pageSize?: number;
};

export type ExtendedAdminOrderSetFilters = {
  fulfillment_status?: FulfillmentStatus[];
  payment_status?: PaymentStatus[];
  seller_id?: string[];
  sales_channel_id?: string[];
  created_at?: string;
  updated_at?: string;
  order?: string;
  q?: string;
  limit?: number;
  offset?: number;
};

export const useOrderSetsTableQuery = ({
  prefix,
  pageSize = 20,
}: UseOrderSetsTableQueryProps) => {
  const queryObject = useQueryParams(
    [
      "offset",
      "q",
      "created_at",
      "updated_at",
      "seller_id",
      "sales_channel_id",
      "payment_status",
      "fulfillment_status",
      "order",
    ],
    prefix,
  );

  const {
    offset,
    sales_channel_id,
    created_at,
    updated_at,
    payment_status,
    fulfillment_status,
    seller_id,
    q,
    order,
  } = queryObject;

  const searchParams: ExtendedAdminOrderSetFilters = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    sales_channel_id: sales_channel_id?.split(","),
    payment_status: payment_status?.split(",") as PaymentStatus[],
    fulfillment_status: fulfillment_status?.split(",") as FulfillmentStatus[],
    created_at: created_at ? JSON.parse(created_at) : undefined,
    updated_at: updated_at ? JSON.parse(updated_at) : undefined,
    seller_id: seller_id?.split(","),
    order: order ? order : "-display_id",
    q,
  };

  return {
    searchParams,
    raw: queryObject,
  };
};
