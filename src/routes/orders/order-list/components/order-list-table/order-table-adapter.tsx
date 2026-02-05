import { useOrders } from '@hooks/api';
import { orderColumnAdapter } from '@lib/table/entity-adapters';
import { createTableAdapter, type TableAdapter } from '@lib/table/table-adapters.ts';
import type { HttpTypes } from '@medusajs/types';

import { useOrderTableFilters } from './use-order-table-filters';

/**
 * Create the order table adapter with all order-specific logic
 */
export function createOrderTableAdapter(): TableAdapter<HttpTypes.AdminOrder> {
  return createTableAdapter<HttpTypes.AdminOrder>({
    entity: 'orders',
    queryPrefix: 'o',
    pageSize: 20,
    columnAdapter: orderColumnAdapter,

    useData: (fields, params) => {
      const { orders, count, isError, error, isLoading } = useOrders(
        {
          fields,
          ...params
        },
        {
          placeholderData: (previousData, previousQuery) => {
            // Only keep placeholder data if the fields haven't changed
            const prevFields = previousQuery?.[previousQuery.length - 1]?.query?.fields;
            if (prevFields && prevFields !== fields) {
              // Fields changed, don't use placeholder data
              return undefined;
            }

            // Fields are the same, keep previous data for smooth transitions
            return previousData;
          }
        }
      );

      return {
        data: orders,
        count,
        isLoading,
        isError,
        error
      };
    },

    getRowHref: row => `/orders/${row.id}`,

    emptyState: {
      empty: {
        heading: 'No orders found'
      }
    }
  });
}

/**
 * Hook to get the order table adapter with filters
 */
export function useOrderTableAdapter(): TableAdapter<HttpTypes.AdminOrder> {
  const filters = useOrderTableFilters();
  const adapter = createOrderTableAdapter();

  // Add dynamic filters to the adapter
  return {
    ...adapter,
    filters
  };
}
