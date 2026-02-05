import { returnReasonsQueryKeys } from '@hooks/api/return-reasons.tsx';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { AdminReturnReasonListParams, AdminReturnReasonListResponse } from '@medusajs/types';

const returnReasonListQuery = (query?: AdminReturnReasonListParams) => ({
  queryKey: returnReasonsQueryKeys.list(query),
  queryFn: async () => sdk.admin.returnReason.list(query)
});

export const returnReasonListLoader = async () => {
  const query = returnReasonListQuery();

  return (
    queryClient.getQueryData<AdminReturnReasonListResponse>(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
};
