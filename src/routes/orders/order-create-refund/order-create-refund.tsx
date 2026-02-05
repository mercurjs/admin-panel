import { RouteDrawer } from '@components/modals';
import { useOrder, usePlugins } from '@hooks/api';
import { getLoyaltyPlugin } from '@lib/plugins';
import { Heading } from '@medusajs/ui';
import { OrderBalanceSettlementForm } from '@routes/orders/order-balance-settlement';
import { CreateRefundForm } from '@routes/orders/order-create-refund/components/create-refund-form';
import { DEFAULT_FIELDS } from '@routes/orders/order-detail/constants.ts';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const OrderCreateRefund = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { order } = useOrder(params.id!, {
    fields: DEFAULT_FIELDS
  });

  const { plugins = [] } = usePlugins();
  const loyaltyPlugin = getLoyaltyPlugin(plugins);

  return (
    <RouteDrawer data-testid="order-create-refund-drawer">
      <RouteDrawer.Header data-testid="order-create-refund-header">
        <Heading data-testid="order-create-refund-heading">
          {t('orders.payment.createRefund')}
        </Heading>
      </RouteDrawer.Header>

      {order && !loyaltyPlugin && <CreateRefundForm order={order} />}
      {order && loyaltyPlugin && <OrderBalanceSettlementForm order={order} />}
    </RouteDrawer>
  );
};
