import type { HttpTypes, PaginatedResponse } from "@medusajs/types";
import type { BaseExchangeItem } from "@medusajs/types/dist/http/exchange/common";

export interface ExtendedAdminExchangeItem extends BaseExchangeItem {
  note?: string | null;
  deleted_at?: string | null;
  raw_quantity?: {
    value: string;
    precision: number;
  };
  item?: {
    id: string;
  };
}
export interface ExtendedAdminExchange
  extends Omit<HttpTypes.AdminExchange, "additional_items"> {
  additional_items: ExtendedAdminExchangeItem[];
}

export interface ExtendedAdminExchangeResponse {
  exchange: ExtendedAdminExchange;
}

export type ExtendedAdminExchangeListResponse = PaginatedResponse<{
  exchanges: ExtendedAdminExchange[];
}>;
export interface AdminAddExchangeOutboundItemsPayload {
  items: {
    variant_id: string;
    quantity: number;
    reason?: string;
    description?: string;
    internal_note?: string;
  }[];
}