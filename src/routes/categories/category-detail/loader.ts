import { categoriesQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

const categoryDetailQuery = (id: string) => ({
  queryKey: categoriesQueryKeys.detail(id),
  queryFn: async () => sdk.admin.productCategory.retrieve(id)
});

export const categoryLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = categoryDetailQuery(id!);

  return queryClient.ensureQueryData(query);
};
