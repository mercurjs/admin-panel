import { productTypesQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

const productTypeDetailQuery = (id: string) => ({
  queryKey: productTypesQueryKeys.detail(id),
  queryFn: async () => sdk.admin.productType.retrieve(id)
});

export const productTypeLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = productTypeDetailQuery(id!);

  return queryClient.ensureQueryData(query);
};
