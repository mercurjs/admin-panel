import { RouteFocusModal } from '@components/modals';
import { useOrder } from '@hooks/api';
import { OrderAllocateItemsForm } from '@routes/orders/order-allocate-items/components/order-create-fulfillment-form';
import { useParams } from 'react-router-dom';

export function OrderAllocateItems() {
  const { id } = useParams();

  const { order, isLoading, isError, error } = useOrder(id!, {
    fields:
      'currency_code,*items,*items.variant,+items.variant.product.title,*items.variant.inventory,*items.variant.inventory.location_levels,*items.variant.inventory_items,*shipping_address'
  });

  if (isError) {
    throw error;
  }

  const ready = !isLoading && order;

  return (
    <RouteFocusModal data-testid="order-allocate-items-modal">
      {ready && <OrderAllocateItemsForm order={order} />}
    </RouteFocusModal>
  );
}
