import { RouteFocusModal } from '@components/modals';
import { useOrder } from '@hooks/api';
import { OrderCreateFulfillmentForm } from '@routes/orders/order-create-fulfillment/components/order-create-fulfillment-form';
import { useParams, useSearchParams } from 'react-router-dom';

export function OrderCreateFulfillment() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requiresShipping = searchParams.get('requires_shipping') === 'true';

  const { order, isLoading, isError, error } = useOrder(id!, {
    fields:
      'currency_code,*items,*items.variant,+items.variant.product.shipping_profile.id,*shipping_address,+shipping_methods.shipping_option_id'
  });

  if (isError) {
    throw error;
  }

  const ready = !isLoading && order;

  return (
    <RouteFocusModal data-testid="order-create-fulfillment-modal">
      {ready && (
        <OrderCreateFulfillmentForm
          order={order}
          requiresShipping={requiresShipping}
        />
      )}
    </RouteFocusModal>
  );
}
