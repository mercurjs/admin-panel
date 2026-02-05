import { productsQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

const customerDetailQuery = (id: string) => ({
  queryKey: productsQueryKeys.detail(id),
  queryFn: async () =>
    sdk.admin.customer.retrieve(id, {
      fields: '+*addresses'
    })
});

export const customerLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = customerDetailQuery(id!);

  return queryClient.ensureQueryData(query);
};
