import { LoaderFunctionArgs } from 'react-router-dom';

import { ordersQueryKeys } from '../../../hooks/api/orders';
import { stockLocationsQueryKeys } from '../../../hooks/api/stock-locations';
import { sdk } from '../../../lib/client';
import { queryClient } from '../../../lib/query-client';
import { DEFAULT_FIELDS } from './constants';

const orderDetailQuery = (id: string) => {
  const query = { fields: DEFAULT_FIELDS };
  return {
    queryKey: ordersQueryKeys.detail(id, query),
    queryFn: async () => sdk.admin.order.retrieve(id, query)
  };
};

const stockLocationsQuery = () => ({
  queryKey: stockLocationsQueryKeys.list({ limit: 9999 }),
  queryFn: async () => sdk.admin.stockLocation.list({ limit: 9999 })
});

export const orderLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const orderQuery = orderDetailQuery(id!);
  const stockLocationsQueryData = stockLocationsQuery();

  const [orderData, stockLocationsData] = await Promise.all([
    queryClient.ensureQueryData(orderQuery),
    queryClient.ensureQueryData(stockLocationsQueryData)
  ]);

  return {
    orderResponse: orderData,
    stockLocations: stockLocationsData?.stock_locations || []
  };
};
