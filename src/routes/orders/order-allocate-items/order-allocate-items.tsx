import { useParams } from 'react-router-dom';

import { RouteFocusModal } from '../../../components/modals';
import { useOrder } from '../../../hooks/api/orders';
import { OrderAllocateItemsForm } from './components/order-create-fulfillment-form';

export function OrderAllocateItems() {
  const { id } = useParams();

  const { order, isLoading, isError, error } = useOrder(id!, {
    fields:
      'currency_code,*items,*items.variant,*items.variant.inventory,*items.variant.inventory.location_levels,*items.variant.inventory_items,+items.variant.product.shipping_profile.id,+items.variant.product.seller.id,*shipping_address,*seller'
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
