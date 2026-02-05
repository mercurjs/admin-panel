import { promotionsQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

const promotionDetailQuery = (id: string) => ({
  queryKey: promotionsQueryKeys.detail(id),
  queryFn: async () => sdk.admin.promotion.retrieve(id)
});

export const promotionLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = promotionDetailQuery(id!);

  return queryClient.ensureQueryData(query);
};
