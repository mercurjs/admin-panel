import type { OrderLineItemDTO } from '@medusajs/types';

export const getFulfillableQuantity = (item: OrderLineItemDTO) =>
  item.quantity - item.detail.fulfilled_quantity;
