import { retrieveActiveStore, storeQueryKeys } from '@hooks/api';
import { queryClient } from '@lib/query-client';
import type { HttpTypes } from '@medusajs/types';

const storeDetailQuery = () => ({
  queryKey: storeQueryKeys.details(),
  queryFn: async () => retrieveActiveStore()
});

export const storeLoader = async () => {
  const query = storeDetailQuery();

  return (
    queryClient.getQueryData<HttpTypes.AdminStoreResponse>(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
};
