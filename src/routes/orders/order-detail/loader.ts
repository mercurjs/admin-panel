import { ordersQueryKeys } from '@hooks/api/orders';
import { stockLocationsQueryKeys } from '@hooks/api/stock-locations';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

import { DEFAULT_FIELDS } from './constants';

const orderDetailQuery = (id: string) => ({
  queryKey: ordersQueryKeys.detail(id),
  queryFn: async () =>
    sdk.admin.order.retrieve(id, {
      fields: DEFAULT_FIELDS
    })
});

const stockLocationsListQuery = () => ({
  queryKey: stockLocationsQueryKeys.list({ limit: 999 }),
  queryFn: async () => sdk.admin.stockLocation.list({ limit: 999 })
});

export const orderLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;

  const [order, stockLocationsResponse] = await Promise.all([
    queryClient.ensureQueryData(orderDetailQuery(id!)),
    queryClient.ensureQueryData(stockLocationsListQuery())
  ]);

  return {
    order: order.order,
    stockLocations: stockLocationsResponse.stock_locations ?? []
  };
};
