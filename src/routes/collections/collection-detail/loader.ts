import { collectionsQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client.ts';
import type { LoaderFunctionArgs } from 'react-router-dom';

const collectionDetailQuery = (id: string) => ({
  queryKey: collectionsQueryKeys.detail(id),
  queryFn: async () => sdk.admin.productCollection.retrieve(id)
});

export const collectionLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = collectionDetailQuery(id!);

  return queryClient.ensureQueryData(query);
};
