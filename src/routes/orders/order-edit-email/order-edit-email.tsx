import { RouteDrawer } from '@components/modals';
import { useOrder } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { DEFAULT_FIELDS } from '@routes/orders/order-detail/constants';
import { EditOrderEmailForm } from '@routes/orders/order-edit-email/components/edit-order-email-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const OrderEditEmail = () => {
  const { t } = useTranslation();
  const params = useParams();

  const { order, isPending, isError, error } = useOrder(params.id!, {
    fields: DEFAULT_FIELDS
  });

  if (!isPending && isError) {
    throw error;
  }

  return (
    <RouteDrawer data-testid="order-edit-email-drawer">
      <RouteDrawer.Header data-testid="order-edit-email-header">
        <Heading data-testid="order-edit-email-heading">{t('orders.edit.email.title')}</Heading>
      </RouteDrawer.Header>

      {order && <EditOrderEmailForm order={order} />}
    </RouteDrawer>
  );
};
