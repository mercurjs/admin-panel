import { RouteDrawer } from '@components/modals';
import { useOrder } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { DEFAULT_FIELDS } from '@routes/orders/order-detail/constants';
import { CreateOrderTransferForm } from '@routes/orders/order-request-transfer/components/create-order-transfer-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const OrderRequestTransfer = () => {
  const { t } = useTranslation();
  const params = useParams();

  // Form is rendered bot on the order details page and customer page so we need to pick the correct param from URL
  const orderId = (params.order_id || params.id) as string;

  const { order, isPending, isError } = useOrder(orderId, {
    fields: DEFAULT_FIELDS
  });

  if (!isPending && isError) {
    throw new Error('Order not found');
  }

  return (
    <RouteDrawer data-testid="order-request-transfer-drawer">
      <RouteDrawer.Header data-testid="order-request-transfer-header">
        <Heading data-testid="order-request-transfer-heading">{t('orders.transfer.title')}</Heading>
      </RouteDrawer.Header>

      {order && <CreateOrderTransferForm order={order} />}
    </RouteDrawer>
  );
};
