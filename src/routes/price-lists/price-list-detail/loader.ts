import { priceListsQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

const pricingDetailQuery = (id: string) => ({
  queryKey: priceListsQueryKeys.detail(id),
  queryFn: async () => sdk.admin.priceList.retrieve(id)
});

export const pricingLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = pricingDetailQuery(id!);

  return queryClient.ensureQueryData(query);
};
