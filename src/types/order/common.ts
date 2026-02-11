import type { SellerDTO } from '@custom-types/seller';
import type {
  AdminOrder,
  CustomerDTO,
  FulfillmentStatus,
  PaginatedResponse,
  PaymentStatus,
  SalesChannelDTO
} from '@medusajs/types';

export interface Order {
  id: string;
  display_id: number;
  region_id: string;
  customer_id: string;
  customer?: CustomerDTO;
  version: number;
  sales_channel_id: string;
  status: string;
  is_draft_order: boolean;
  email: string;
  currency_code: string;
  no_notification: boolean;
  metadata: null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  shipping_address_id: string;
  billing_address_id: string;
  items: { id: string }[];
  seller: SellerDTO;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  total: number;
}

export interface OrderResponse {
  order: Order;
}

export interface OrderListResponse {
  orders: Order[];
  count?: number;
}

export interface OrderQueryParams {
  limit?: number;
  offset?: number;
  fields?: string;
  expand?: string;
  order?: string;
  created_at?: string;
  updated_at?: string;
  status?: string[];
  region_id?: string[];
  sales_channel_id?: string[];
  q?: string;
}

export interface OrderSet {
  id: string;
  display_id: number;
  customer_id: string;
  customer?: CustomerDTO;
  sales_channel_id?: string;
  sales_channel?: SalesChannelDTO;
  created_at: string;
  updated_at: string;
  currency_code: string;
  total: number;
  orders: Order[];
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
}

export type OrderTableRow = OrderSet;

export type AdminOrderListResponse = PaginatedResponse<{
  orders: AdminOrder[];
}>;

export interface AdminOrderSetListResponse {
  order_sets: OrderSet[];
  count?: number;
  offset?: number;
  limit?: number;
}
