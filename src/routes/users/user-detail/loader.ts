import { productsQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

const userDetailQuery = (id: string) => ({
  queryKey: productsQueryKeys.detail(id),
  queryFn: async () => sdk.admin.user.retrieve(id)
});

export const userLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = userDetailQuery(id!);

  return queryClient.ensureQueryData(query);
};
