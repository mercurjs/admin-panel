import { useMemo } from 'react';

import { DateCell } from '@components/table/table-cells/common/date-cell';
import { TextCell, TextHeader } from '@components/table/table-cells/common/text-cell';
import {
  FulfillmentStatusCell,
  FulfillmentStatusHeader
} from '@components/table/table-cells/order/fulfillment-status-cell';
import {
  PaymentStatusCell,
  PaymentStatusHeader
} from '@components/table/table-cells/order/payment-status-cell';
import { TotalCell, TotalHeader } from '@components/table/table-cells/order/total-cell';
import type { Order, OrderSet } from '@custom-types/order';
import { TriangleRightMini } from '@medusajs/icons';
import { clx, IconButton } from '@medusajs/ui';
import { hasMultipleOrders, isOrderSet } from '@routes/orders/order-list/utils/is-order-set';
import { createColumnHelper, type CellContext } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<OrderSet | Order>();

type RowContext = CellContext<OrderSet | Order, unknown>['row'];

function getOrderFromRow(row: RowContext): Order | null {
  if (row.depth > 0) {
    return isOrderSet(row.original) ? null : row.original;
  }
  if (isOrderSet(row.original) && !hasMultipleOrders(row.original)) {
    return row.original.orders[0] ?? null;
  }

  return null;
}

function renderOrderCell<T>(
  row: RowContext,
  renderOrder: (order: Order) => T,
  renderMultiple?: (orderSet: OrderSet) => T | null
): T | null {
  const order = getOrderFromRow(row);

  if (order) {
    return renderOrder(order);
  }

  if (isOrderSet(row.original)) {
    return renderMultiple?.(row.original) ?? null;
  }

  return null;
}

export const useOrderSetTableColumns = () => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      columnHelper.display({
        id: 'group_id',
        header: () => <TextHeader text={t('fields.groupId')} />,
        cell: ({ row }) => {
          if (row.depth > 0) {
            return <div className="pl-10" />;
          }

          if (!isOrderSet(row.original) || !hasMultipleOrders(row.original)) {
            return null;
          }

          return (
            <div className="flex items-center gap-x-2">
              <div className="flex size-7 items-center justify-center">
                {row.getCanExpand() && (
                  <IconButton
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      row.getToggleExpandedHandler()();
                    }}
                    size="small"
                    variant="transparent"
                    className="text-ui-fg-subtle"
                  >
                    <TriangleRightMini
                      className={clx({
                        'rotate-90 transition-transform will-change-transform': row.getIsExpanded()
                      })}
                    />
                  </IconButton>
                )}
              </div>
              <span className="font-medium">#{`G${row.original.display_id}`}</span>
            </div>
          );
        }
      }),

      columnHelper.display({
        id: 'display_id',
        header: () => <TextHeader text={t('fields.orderId')} />,
        cell: ({ row }) =>
          renderOrderCell(
            row,
            order => <TextCell text={`#${order.display_id}`} />,
            orderSet => <TextCell text={orderSet.orders.map(o => `#${o.display_id}`).join(', ')} />
          )
      }),

      columnHelper.display({
        id: 'vendor',
        header: () => <TextHeader text={t('fields.vendor')} />,
        cell: ({ row }) => {
          const fallback = t('orders.list.vendorFallback');

          return renderOrderCell(
            row,
            order => <TextCell text={order.seller?.name ?? fallback} />,
            orderSet => {
              const uniqueVendorIds = new Set(
                orderSet.orders.map(o => o.seller?.id).filter(Boolean)
              );
              const text =
                uniqueVendorIds.size === 1
                  ? (orderSet.orders[0]?.seller?.name ?? fallback)
                  : t('orders.list.multipleVendors', {
                      count: uniqueVendorIds.size
                    });

              return <TextCell text={text} />;
            }
          );
        }
      }),

      columnHelper.display({
        id: 'created_at',
        header: () => <TextHeader text={t('fields.date')} />,
        cell: ({ row }) => {
          const order = getOrderFromRow(row);

          if (order) {
            return <DateCell date={order.created_at} />;
          }

          if (isOrderSet(row.original)) {
            return <DateCell date={row.original.created_at} />;
          }

          return null;
        }
      }),

      columnHelper.display({
        id: 'customer',
        header: () => <TextHeader text={t('fields.customer')} />,
        cell: ({ row }) => {
          const { customer } = row.original;
          if (customer?.first_name || customer?.last_name) {
            return (
              <TextCell text={`${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim()} />
            );
          }
          if (customer?.email) {
            return <TextCell text={customer.email} />;
          }

          return null;
        }
      }),

      columnHelper.display({
        id: 'payment_status',
        header: () => <PaymentStatusHeader />,
        cell: ({ row }) =>
          renderOrderCell(row, order => <PaymentStatusCell status={order.payment_status} />)
      }),

      columnHelper.display({
        id: 'fulfillment_status',
        header: () => <FulfillmentStatusHeader />,
        cell: ({ row }) =>
          renderOrderCell(row, order => <FulfillmentStatusCell status={order.fulfillment_status} />)
      }),

      columnHelper.display({
        id: 'total',
        header: () => <TotalHeader />,
        cell: ({ row }) =>
          renderOrderCell(
            row,
            order => (
              <TotalCell
                currencyCode={order.currency_code}
                total={order.total}
              />
            ),
            orderSet => (
              <TotalCell
                currencyCode={orderSet.currency_code}
                total={orderSet.total}
              />
            )
          )
      })
    ],
    [t]
  );
};
