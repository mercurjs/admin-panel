import { OrderStatusBadge } from '@components/common/order-status-badge';
import { PaymentStatusBadge } from '@components/common/payments-status-badge';
import { useOrderSet } from '@hooks/api/sellers';
import { Badge, Button, Container, Heading, Text } from '@medusajs/ui';
import { useNavigate, useParams } from 'react-router-dom';

export const OrderRemainingOrdersGroupSection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useOrderSet(id!);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const { order_sets } = data || {};

  const { orders } = order_sets?.[0] || {};

  return (
    <Container data-testid="order-remaining-orders-group-section">
      <Heading
        level="h2"
        className="text-lg font-medium"
        data-testid="order-remaining-orders-group-heading"
      >
        Remaining orders group
      </Heading>
      <div data-testid="order-remaining-orders-group-list">
        {/*@todo fix any type */}
        {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
        {orders?.map((order: any) => {
          const items =
            order.items.length > 1
              ? `${order.items[0].subtitle} + ${order.items.length - 1} more`
              : order.items[0].subtitle;

          return (
            <Button
              variant="secondary"
              key={order.id}
              className="mt-4 flex w-full cursor-pointer text-left"
              onClick={() => {
                navigate(`/orders/${order.id}`);
              }}
              data-testid={`order-remaining-orders-group-item-${order.id}`}
            >
              <div className="relative w-full">
                <div className="flex items-center justify-between gap-2">
                  <Heading
                    level="h3"
                    className="text-md w-1/3 truncate font-medium"
                    data-testid={`order-remaining-orders-group-item-${order.id}-heading`}
                  >
                    #{order.display_id}
                  </Heading>
                  <div
                    className="flex w-2/3"
                    data-testid={`order-remaining-orders-group-item-${order.id}-badges`}
                  >
                    <Badge className="-mr-8 scale-75">
                      <span className="mr-2 text-xs">Payment</span>
                      <PaymentStatusBadge status={order.payment_collections[0].status} />
                    </Badge>
                    <Badge className="-mr-4 scale-75">
                      <span className="mr-2 text-xs">Order</span>
                      <OrderStatusBadge status={order.status} />
                    </Badge>
                  </div>
                </div>
                <Text
                  className="truncate"
                  data-testid={`order-remaining-orders-group-item-${order.id}-items`}
                >
                  {items}
                </Text>
              </div>
            </Button>
          );
        })}
      </div>
    </Container>
  );
};
