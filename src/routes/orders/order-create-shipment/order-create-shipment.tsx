import { RouteFocusModal } from '@components/modals';
import { useOrder } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import { OrderCreateShipmentForm } from '@routes/orders/order-create-shipment/components/order-create-shipment-form';
import { useParams } from 'react-router-dom';

export function OrderCreateShipment() {
  const { id, f_id } = useParams();

  const { order, isLoading, isError, error } = useOrder(id!, {
    fields: '*fulfillments,*fulfillments.items,*fulfillments.labels'
  });

  if (isError) {
    throw error;
  }

  const ready = !isLoading && order;

  return (
    <RouteFocusModal data-testid="order-create-shipment-modal">
      {ready && (
        <OrderCreateShipmentForm
          order={order}
          fulfillment={order.fulfillments?.find(
            (f: HttpTypes.AdminOrderFulfillment) => f.id === f_id
          )}
        />
      )}
    </RouteFocusModal>
  );
}
