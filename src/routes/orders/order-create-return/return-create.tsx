import { useEffect, useState } from 'react';

import { RouteFocusModal } from '@components/modals';
import { useOrder, useOrderPreview } from '@hooks/api';
import { useInitiateReturn, useReturn } from '@hooks/api/returns';
import { toast } from '@medusajs/ui';
import { ReturnCreateForm } from '@routes/orders/order-create-return/components/return-create-form';
import { DEFAULT_FIELDS } from '@routes/orders/order-detail/constants';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

let IS_REQUEST_RUNNING = false;

export const ReturnCreate = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { order } = useOrder(id!, {
    fields: DEFAULT_FIELDS
  });

  const { order: preview } = useOrderPreview(id!, undefined, {});

  const [activeReturnId, setActiveReturnId] = useState();

  const { mutateAsync: initiateReturn } = useInitiateReturn(order.id);

  const { return: activeReturn } = useReturn(activeReturnId, undefined, {
    enabled: !!activeReturnId
  });

  useEffect(() => {
    async function run() {
      if (IS_REQUEST_RUNNING || !preview) {
        return;
      }

      if (preview.order_change) {
        if (preview.order_change.change_type === 'return_request') {
          setActiveReturnId(preview.order_change.return_id);
        } else {
          navigate(`/orders/${order.id}`, { replace: true });
          toast.error(t('orders.returns.activeChangeError'));
        }

        return;
      }

      IS_REQUEST_RUNNING = true;

      try {
        const orderReturn = await initiateReturn({ order_id: order.id });
        setActiveReturnId(orderReturn.id);
      } catch (e) {
        navigate(`/orders/${order.id}`, { replace: true });
        toast.error(e.message);
      } finally {
        IS_REQUEST_RUNNING = false;
      }
    }

    run();
  }, [preview]);

  return (
    <RouteFocusModal data-testid="order-create-return-modal">
      {activeReturn && preview && order && (
        <ReturnCreateForm
          order={order}
          activeReturn={activeReturn}
          preview={preview}
        />
      )}
    </RouteFocusModal>
  );
};
