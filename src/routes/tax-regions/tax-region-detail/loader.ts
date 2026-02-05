import { taxRegionsQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

const taxRegionDetailQuery = (id: string) => ({
  queryKey: taxRegionsQueryKeys.detail(id),
  queryFn: async () => sdk.admin.taxRegion.retrieve(id)
});

export const taxRegionLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = taxRegionDetailQuery(id!);

  return queryClient.ensureQueryData(query);
};
