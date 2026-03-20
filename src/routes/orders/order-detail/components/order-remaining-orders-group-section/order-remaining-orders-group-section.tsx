import { Button, Container, Heading, StatusBadge, Text } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useOrderSet } from '@/hooks/api/sellers';
import { useDate } from '@/hooks/use-date';
import { getOrderFulfillmentStatus, getOrderPaymentStatus } from '@/lib/order-helpers';

export const OrderRemainingOrdersGroupSection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFullDate } = useDate();

  const { data } = useOrderSet(id!);

  const { order_sets } = data || {};

  const { orders: ordersBase, display_id } = order_sets?.[0] || {};

  const orders = ordersBase?.filter(baseOrder => baseOrder.id !== id);

  if (!orders || orders.length === 0) {
    return null;
  }

  return (
    <Container
      className="divide-y p-0"
      data-testid="order-remaining-orders-group-section"
    >
      <Heading
        level="h2"
        className="flex items-center justify-between px-6 py-4"
      >
        Other orders from this group #{display_id}
      </Heading>
      <div data-testid="order-remaining-orders-group-list">
        {orders.map(order => {
          const paymentStatus = getOrderPaymentStatus(t, order.payment_status ?? 'not_paid');
          const fulfillmentStatus = getOrderFulfillmentStatus(
            t,
            order.fulfillment_status ?? 'not_fulfilled'
          );

          return (
            <Button
              variant="secondary"
              key={order.id}
              className="cursor-pointer w-full flex text-left mt-4"
              onClick={() => {
                navigate(`/orders/${order.id}`);
              }}
              data-testid={`order-remaining-orders-group-item-${order.id}`}
            >
              <div className="flex-1">
                <Heading
                  className="text-base font-medium"
                  data-testid={`order-remaining-orders-group-item-${order.id}-heading`}
                >
                  #{order.display_id}
                </Heading>
                <Text
                  size="small"
                  className="text-ui-fg-subtle"
                >
                  {getFullDate({
                    date: order.created_at,
                    includeTime: true
                  })}
                </Text>
              </div>
              <div
                className="flex items-center gap-2"
                data-testid={`order-remaining-orders-group-item-${order.id}-badges`}
              >
                <StatusBadge color={paymentStatus.color}>{paymentStatus.label}</StatusBadge>
                <StatusBadge color={fulfillmentStatus.color}>{fulfillmentStatus.label}</StatusBadge>
              </div>
            </Button>
          );
        })}
      </div>
    </Container>
  );
};
