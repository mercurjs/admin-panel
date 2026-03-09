import { useEffect, useMemo } from 'react';

import { RouteDrawer } from '@components/modals';
import { useOrder, useOrderPreview } from '@hooks/api/orders';
import { useAddReceiveItems, useInitiateReceiveReturn, useReturn } from '@hooks/api/returns.tsx';
import { useStockLocations } from '@hooks/api/stock-locations';
import { Heading, toast } from '@medusajs/ui';
import { OrderReceiveReturnForm } from '@routes/orders/order-receive-return/components/order-receive-return-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

let IS_REQUEST_RUNNING = false;

export function OrderReceiveReturn() {
  const { id, return_id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  /**
   * HOOKS
   */

  const { order } = useOrder(id!, { fields: '+currency_code,*items' });
  const { order: preview } = useOrderPreview(id!);
  const { return: orderReturn } = useReturn(return_id, {
    fields: '*items.item,*items.item.variant,*items.item.variant.product,+location_id'
  }); // TODO: fix API needs to return 404 if return not exists and not an empty object

  const { stock_locations = [] } = useStockLocations({ limit: 999 });
  const adminLocationIds = useMemo(
    () => new Set(stock_locations.map(loc => loc.id)),
    [stock_locations]
  );

  /**
   * MUTATIONS
   */

  const { mutateAsync: initiateReceiveReturn } = useInitiateReceiveReturn(return_id, id);

  const { mutateAsync: addReceiveItems } = useAddReceiveItems(return_id, id);

  useEffect(() => {
    (async function () {
      if (IS_REQUEST_RUNNING || !preview) {
        return;
      }

      if (preview.order_change) {
        if (preview.order_change.change_type !== 'return_receive') {
          navigate(`/orders/${id}`, { replace: true });
          toast.error(t('orders.returns.activeChangeError'));
        }

        return;
      }

      IS_REQUEST_RUNNING = true;

      try {
        const { return: _return } = await initiateReceiveReturn({});

        await addReceiveItems({
          items: _return.items.map(i => ({
            id: i.item_id,
            quantity: i.quantity
          }))
        });
      } catch (e) {
        toast.error(e.message);
      } finally {
        IS_REQUEST_RUNNING = false;
      }
    })();
  }, [preview]);

  const ready = order && orderReturn && preview;

  return (
    <RouteDrawer data-testid="order-receive-return-drawer">
      <RouteDrawer.Header data-testid="order-receive-return-header">
        <Heading data-testid="order-receive-return-heading">
          {t('orders.returns.receive.title', {
            returnId: return_id?.slice(-7)
          })}
        </Heading>
      </RouteDrawer.Header>
      {ready && (
        <OrderReceiveReturnForm
          order={order}
          orderReturn={orderReturn}
          preview={preview}
          adminLocationIds={adminLocationIds}
        />
      )}
    </RouteDrawer>
  );
}
