import { productTagsQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

const productTagDetailQuery = (id: string) => ({
  queryKey: productTagsQueryKeys.detail(id),
  queryFn: async () => sdk.admin.productTag.retrieve(id)
});

export const productTagLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = productTagDetailQuery(id!);

  return queryClient.ensureQueryData(query);
};
