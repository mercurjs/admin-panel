import type {
  BigNumberInput,
  CartDTO,
  CustomerDTO,
  FulfillmentStatus,
  OrderDTO,
  OrderDetailDTO,
  OrderStatus,
  PaymentCollectionDTO,
  PaymentCollectionStatus,
  SalesChannelDTO
} from '@medusajs/types'

export type OrderGroupDTO = {
  id: string
  created_at: Date
  updated_at: Date
  display_id: number
  customer_id?: string
  customer?: CustomerDTO
  cart_id: string
  cart?: CartDTO

  sales_channel_id?: string
  sales_channel?: SalesChannelDTO

  payment_collection_id?: string
  payment_collection?: PaymentCollectionDTO
}

export type OrderGroupWithOrdersDTO = OrderGroupDTO & {
  orders: (OrderDTO & OrderDetailDTO)[]
}

export type FormattedOrderGroupDTO = OrderGroupDTO & {
  status: OrderStatus
  payment_status: PaymentCollectionStatus
  fulfillment_status: FulfillmentStatus

  total: BigNumberInput
  tax_total: BigNumberInput
  subtotal: BigNumberInput
  shipping_total: BigNumberInput
  shipping_tax_total: BigNumberInput
}
