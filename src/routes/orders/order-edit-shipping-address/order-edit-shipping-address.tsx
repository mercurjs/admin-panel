import { RouteDrawer } from '@components/modals';
import { useOrder } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { DEFAULT_FIELDS } from '@routes/orders/order-detail/constants';
import { EditOrderShippingAddressForm } from '@routes/orders/order-edit-shipping-address/components/edit-order-shipping-address-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const OrderEditShippingAddress = () => {
  const { t } = useTranslation();
  const params = useParams();

  const { order, isPending, isError } = useOrder(params.id!, {
    fields: DEFAULT_FIELDS
  });

  if (!isPending && isError) {
    throw new Error('Order not found');
  }

  return (
    <RouteDrawer data-testid="order-edit-shipping-address-drawer">
      <RouteDrawer.Header data-testid="order-edit-shipping-address-header">
        <Heading data-testid="order-edit-shipping-address-heading">
          {t('orders.edit.shippingAddress.title')}
        </Heading>
      </RouteDrawer.Header>

      {order && <EditOrderShippingAddressForm order={order} />}
    </RouteDrawer>
  );
};
