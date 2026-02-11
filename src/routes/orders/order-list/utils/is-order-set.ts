import { Order, OrderSet } from '@custom-types/order';

export function hasMultipleOrders(orderSet: OrderSet): boolean {
  return orderSet.orders && orderSet.orders.length > 1;
}

export function isOrderSet(value: OrderSet | Order): value is OrderSet {
  return 'orders' in value;
}
