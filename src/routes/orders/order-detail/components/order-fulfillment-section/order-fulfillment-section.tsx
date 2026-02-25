import { Fragment, useMemo } from 'react';

import { Buildings, InformationCircle, XCircle } from '@medusajs/icons';
import {
  AdminOrder,
  AdminOrderFulfillment,
  AdminOrderLineItem,
  HttpTypes,
  OrderLineItemDTO
} from '@medusajs/types';
import {
  Button,
  Container,
  Copy,
  Heading,
  StatusBadge,
  Text,
  toast,
  Tooltip,
  usePrompt
} from '@medusajs/ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { ActionMenu } from '../../../../../components/common/action-menu';
import { Skeleton } from '../../../../../components/common/skeleton';
import { Thumbnail } from '../../../../../components/common/thumbnail';
import {
  useCancelOrderFulfillment,
  useMarkOrderFulfillmentAsDelivered
} from '../../../../../hooks/api/orders';
import { useStockLocation } from '../../../../../hooks/api/stock-locations';
import { formatProvider } from '../../../../../lib/format-provider';
import { getLocaleAmount } from '../../../../../lib/money-amount-helpers';
import { filterItemsFulfillableByAdmin } from '../../../../../lib/order-item';
import { FulfillmentSetType } from '../../../../locations/common/constants';

type OrderFulfillmentSectionProps = {
  order: AdminOrder;
  stockLocations: HttpTypes.AdminStockLocation[];
};

export const OrderFulfillmentSection = ({
  order,
  stockLocations
}: OrderFulfillmentSectionProps) => {
  const fulfillments = order.fulfillments || [];

  return (
    <div
      className="flex flex-col gap-y-3"
      data-testid="order-fulfillment-section"
    >
      <UnfulfilledItemBreakdown
        order={order}
        stockLocations={stockLocations}
      />
      {fulfillments.map((f, index) => (
        <Fulfillment
          key={f.id}
          index={index}
          fulfillment={f}
          order={order}
          stockLocations={stockLocations}
        />
      ))}
    </div>
  );
};

const UnfulfilledItem = ({
  item,
  currencyCode
}: {
  item: OrderLineItemDTO & { variant: HttpTypes.AdminProductVariant };
  currencyCode: string;
}) => {
  return (
    <div
      key={item.id}
      className="grid grid-cols-2 items-start px-6 py-4 text-ui-fg-subtle"
    >
      <div className="flex items-start gap-x-4">
        <Thumbnail src={item.thumbnail} />
        <div>
          <Text
            size="small"
            leading="compact"
            weight="plus"
            className="text-ui-fg-base"
          >
            {item.title}
          </Text>
          {item.variant_sku && (
            <div className="flex items-center gap-x-1">
              <Text size="small">{item.variant_sku}</Text>
              <Copy
                content={item.variant_sku}
                className="text-ui-fg-muted"
              />
            </div>
          )}
          <Text size="small">{item.variant?.options?.map(o => o.value).join(' · ')}</Text>
        </div>
      </div>
      <div className="grid grid-cols-3 items-center gap-x-4">
        <div className="flex items-center justify-end">
          <Text size="small">{getLocaleAmount(item.unit_price, currencyCode)}</Text>
        </div>
        <div className="flex items-center justify-end">
          <Text>
            <span className="tabular-nums">{item.quantity - item.detail.fulfilled_quantity}</span>x
          </Text>
        </div>
        <div className="flex items-center justify-end">
          <Text size="small">{getLocaleAmount(item.subtotal || 0, currencyCode)}</Text>
        </div>
      </div>
    </div>
  );
};

const UnfulfilledItemBreakdown = ({
  order,
  stockLocations
}: {
  order: AdminOrder;
  stockLocations: HttpTypes.AdminStockLocation[];
}) => {
  // Create an array of order items that haven't been fulfilled or at least not fully fulfilled
  const unfulfilledItemsWithShipping = order.items!.filter(
    i => i.requires_shipping && i.detail.fulfilled_quantity < i.quantity
  );

  const unfulfilledItemsWithoutShipping = order.items!.filter(
    i => !i.requires_shipping && i.detail.fulfilled_quantity < i.quantity
  );

  return (
    <>
      {!!unfulfilledItemsWithShipping.length && (
        <UnfulfilledItemDisplay
          order={order}
          unfulfilledItems={unfulfilledItemsWithShipping}
          requiresShipping={true}
          stockLocations={stockLocations}
        />
      )}

      {!!unfulfilledItemsWithoutShipping.length && (
        <UnfulfilledItemDisplay
          order={order}
          unfulfilledItems={unfulfilledItemsWithoutShipping}
          requiresShipping={false}
          stockLocations={stockLocations}
        />
      )}
    </>
  );
};

const UnfulfilledItemDisplay = ({
  order,
  unfulfilledItems,
  requiresShipping = false,
  stockLocations
}: {
  order: AdminOrder;
  unfulfilledItems: AdminOrderLineItem[];
  requiresShipping: boolean;
  stockLocations: HttpTypes.AdminStockLocation[];
}) => {
  const { t } = useTranslation();

  if (order.status === 'canceled') {
    return;
  }

  const adminLocationIds = useMemo(() => {
    return new Set(stockLocations.map(location => location.id));
  }, [stockLocations]);

  const itemsThatCanBeFulfilled = filterItemsFulfillableByAdmin(order.items, adminLocationIds);
  const canAdminFulfill = itemsThatCanBeFulfilled.length > 0;

  return (
    <Container
      className="divide-y overflow-hidden p-0"
      data-testid="order-fulfillment-unfulfilled"
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        data-testid="order-fulfillment-unfulfilled-header"
      >
        <Heading
          level="h2"
          data-testid="order-fulfillment-unfulfilled-heading"
        >
          {t('orders.fulfillment.unfulfilledItems')}
        </Heading>

        <div
          className="flex items-center gap-x-4"
          data-testid="order-fulfillment-unfulfilled-badges"
        >
          {requiresShipping && (
            <StatusBadge
              color="red"
              className="text-nowrap"
              data-testid="order-fulfillment-unfulfilled-requires-shipping-badge"
            >
              {t('orders.fulfillment.requiresShipping')}
            </StatusBadge>
          )}

          <StatusBadge
            color="red"
            className="text-nowrap"
            data-testid="order-fulfillment-unfulfilled-awaiting-badge"
          >
            {t('orders.fulfillment.awaitingFulfillmentBadge')}
          </StatusBadge>

          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t('orders.fulfillment.fulfillItems'),
                    icon: <Buildings />,
                    to: `/orders/${order.id}/fulfillment?requires_shipping=${requiresShipping}`,
                    disabled: !canAdminFulfill
                  }
                ]
              }
            ]}
            data-testid="order-fulfillment-unfulfilled-action-menu"
          />
        </div>
      </div>
      <div data-testid="order-fulfillment-unfulfilled-items">
        {unfulfilledItems.map((item: AdminOrderLineItem) => {
          const cantBeFulfilledByAdmin =
            itemsThatCanBeFulfilled.findIndex(i => i.id === item.id) === -1;
          return (
            <Fragment key={item.id}>
              <UnfulfilledItem
                item={item}
                currencyCode={order.currency_code}
              />
              {cantBeFulfilledByAdmin && (
                <div className="flex items-center gap-x-3 border-t border-dashed bg-ui-bg-subtle px-6 py-4 text-ui-fg-subtle">
                  <InformationCircle className="text-ui-fg-subtle" />
                  <Text size="small">{t('orders.fulfillment.cantBeFulfilledByAdmin')}</Text>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </Container>
  );
};

const Fulfillment = ({
  fulfillment,
  order,
  index,
  stockLocations
}: {
  fulfillment: AdminOrderFulfillment;
  order: AdminOrder;
  index: number;
  stockLocations: HttpTypes.AdminStockLocation[];
}) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const navigate = useNavigate();

  const canAdminFulfill = stockLocations.some(location => location.id === fulfillment.location_id);

  const showLocation = !!fulfillment.location_id;

  const isPickUpFulfillment =
    fulfillment.shipping_option?.service_zone.fulfillment_set.type === FulfillmentSetType.Pickup;

  const { stock_location, isError, error } = useStockLocation(fulfillment.location_id!, undefined, {
    enabled: showLocation
  });

  let statusText = fulfillment.requires_shipping
    ? isPickUpFulfillment
      ? 'Awaiting pickup'
      : 'Awaiting shipping'
    : 'Awaiting delivery';
  let statusColor: 'blue' | 'green' | 'red' = 'blue';
  let statusTimestamp = fulfillment.created_at;

  if (fulfillment.canceled_at) {
    statusText = 'Canceled';
    statusColor = 'red';
    statusTimestamp = fulfillment.canceled_at;
  } else if (fulfillment.delivered_at) {
    statusText = 'Delivered';
    statusColor = 'green';
    statusTimestamp = fulfillment.delivered_at;
  } else if (fulfillment.shipped_at) {
    statusText = 'Shipped';
    statusColor = 'green';
    statusTimestamp = fulfillment.shipped_at;
  }

  const { mutateAsync } = useCancelOrderFulfillment(order.id, fulfillment.id);
  const { mutateAsync: markAsDelivered } = useMarkOrderFulfillmentAsDelivered(
    order.id,
    fulfillment.id
  );

  const showShippingButton =
    !fulfillment.canceled_at &&
    !fulfillment.shipped_at &&
    !fulfillment.delivered_at &&
    fulfillment.requires_shipping &&
    !isPickUpFulfillment;

  const showDeliveryButton = !fulfillment.canceled_at && !fulfillment.delivered_at;

  const handleMarkAsDelivered = async () => {
    const res = await prompt({
      title: t('general.areYouSure'),
      description: t('orders.fulfillment.markAsDeliveredWarning'),
      confirmText: t('actions.continue'),
      cancelText: t('actions.cancel'),
      variant: 'confirmation'
    });

    if (res) {
      await markAsDelivered(undefined, {
        onSuccess: () => {
          toast.success(
            t(
              isPickUpFulfillment
                ? 'orders.fulfillment.toast.fulfillmentPickedUp'
                : 'orders.fulfillment.toast.fulfillmentDelivered'
            )
          );
        },
        onError: e => {
          toast.error(e.message);
        }
      });
    }
  };

  const handleCancel = async () => {
    if (fulfillment.shipped_at) {
      toast.warning(t('orders.fulfillment.toast.fulfillmentShipped'));
      return;
    }

    const res = await prompt({
      title: t('general.areYouSure'),
      description: t('orders.fulfillment.cancelWarning'),
      confirmText: t('actions.continue'),
      cancelText: t('actions.cancel')
    });

    if (res) {
      await mutateAsync(undefined, {
        onSuccess: () => {
          toast.success(t('orders.fulfillment.toast.canceled'));
        },
        onError: e => {
          toast.error(e.message);
        }
      });
    }
  };

  if (isError) {
    throw error;
  }

  const isValidUrl = (url?: string) => url && url.length > 0 && url !== '#';

  return (
    <Container
      className="divide-y p-0"
      data-testid={`order-fulfillment-${fulfillment.id}`}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        data-testid={`order-fulfillment-${fulfillment.id}-header`}
      >
        <Heading
          level="h2"
          data-testid={`order-fulfillment-${fulfillment.id}-heading`}
        >
          {t('orders.fulfillment.number', {
            number: index + 1
          })}
        </Heading>
        <div
          className="flex items-center gap-x-4"
          data-testid={`order-fulfillment-${fulfillment.id}-status-container`}
        >
          <Tooltip content={format(new Date(statusTimestamp), 'dd MMM, yyyy, HH:mm:ss')}>
            <StatusBadge
              color={statusColor}
              className="text-nowrap"
              data-testid={`order-fulfillment-${fulfillment.id}-status-badge`}
            >
              {statusText}
            </StatusBadge>
          </Tooltip>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t('actions.cancel'),
                    icon: <XCircle />,
                    onClick: handleCancel,
                    disabled:
                      !!fulfillment.canceled_at ||
                      !!fulfillment.shipped_at ||
                      !!fulfillment.delivered_at ||
                      !canAdminFulfill
                  }
                ]
              }
            ]}
            data-testid={`order-fulfillment-${fulfillment.id}-action-menu`}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 items-start px-6 py-4 text-ui-fg-subtle">
        <Text
          size="small"
          leading="compact"
          weight="plus"
        >
          {t('orders.fulfillment.itemsLabel')}
        </Text>
        <ul>
          {fulfillment.items.map(f_item => (
            <li key={f_item.line_item_id}>
              <Text
                size="small"
                leading="compact"
              >
                {f_item.quantity}x {f_item.title}
              </Text>
            </li>
          ))}
        </ul>
      </div>
      {showLocation && (
        <div className="grid grid-cols-2 items-center px-6 py-4 text-ui-fg-subtle">
          <Text
            size="small"
            leading="compact"
            weight="plus"
          >
            {t('orders.fulfillment.shippingFromLabel')}
          </Text>
          {stock_location ? (
            <Link
              to={`/settings/locations/${stock_location.id}`}
              className="text-ui-fg-interactive transition-fg hover:text-ui-fg-interactive-hover"
            >
              <Text
                size="small"
                leading="compact"
              >
                {stock_location.name}
              </Text>
            </Link>
          ) : (
            <Skeleton className="w-16" />
          )}
        </div>
      )}
      <div className="grid grid-cols-2 items-center px-6 py-4 text-ui-fg-subtle">
        <Text
          size="small"
          leading="compact"
          weight="plus"
        >
          {t('fields.provider')}
        </Text>

        <Text
          size="small"
          leading="compact"
        >
          {formatProvider(fulfillment.provider_id)}
        </Text>
      </div>
      <div className="grid grid-cols-2 items-start px-6 py-4 text-ui-fg-subtle">
        <Text
          size="small"
          leading="compact"
          weight="plus"
        >
          {t('orders.fulfillment.trackingLabel')}
        </Text>
        <div>
          {fulfillment.labels && fulfillment.labels.length > 0 ? (
            <ul>
              {fulfillment.labels.map(tlink => {
                const hasTrackingUrl = isValidUrl(tlink.tracking_url);
                const hasLabelUrl = isValidUrl(tlink.label_url);

                if (hasTrackingUrl || hasLabelUrl) {
                  return (
                    <li key={tlink.tracking_number}>
                      {hasTrackingUrl && (
                        <a
                          href={tlink.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ui-fg-interactive transition-fg hover:text-ui-fg-interactive-hover"
                        >
                          <Text
                            size="small"
                            leading="compact"
                            as="span"
                          >
                            {tlink.tracking_number}
                          </Text>
                        </a>
                      )}
                      {hasTrackingUrl && hasLabelUrl && ' - '}
                      {hasLabelUrl && (
                        <a
                          href={tlink.label_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ui-fg-interactive transition-fg hover:text-ui-fg-interactive-hover"
                        >
                          <Text
                            size="small"
                            leading="compact"
                            as="span"
                          >
                            Label
                          </Text>
                        </a>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={tlink.tracking_number}>
                    <Text
                      size="small"
                      leading="compact"
                    >
                      {tlink.tracking_number}
                    </Text>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Text
              size="small"
              leading="compact"
            >
              -
            </Text>
          )}
        </div>
      </div>

      {(showShippingButton || showDeliveryButton) && canAdminFulfill && (
        <div
          className="flex items-center justify-end gap-x-2 rounded-b-xl bg-ui-bg-subtle px-4 py-4"
          data-testid={`order-fulfillment-${fulfillment.id}-actions`}
        >
          {showDeliveryButton && (
            <Button
              onClick={handleMarkAsDelivered}
              variant="secondary"
              data-testid={`order-fulfillment-${fulfillment.id}-mark-delivered-button`}
            >
              {t(
                isPickUpFulfillment
                  ? 'orders.fulfillment.markAsPickedUp'
                  : 'orders.fulfillment.markAsDelivered'
              )}
            </Button>
          )}

          {showShippingButton && (
            <Button
              onClick={() => navigate(`./${fulfillment.id}/create-shipment`)}
              variant="secondary"
              data-testid={`order-fulfillment-${fulfillment.id}-mark-shipped-button`}
            >
              {t('orders.fulfillment.markAsShipped')}
            </Button>
          )}
        </div>
      )}
    </Container>
  );
};
