import { reservationItemsQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

const reservationDetailQuery = (id: string) => ({
  queryKey: reservationItemsQueryKeys.detail(id),
  queryFn: async () => sdk.admin.reservation.retrieve(id)
});

export const reservationItemLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = reservationDetailQuery(id!);

  return queryClient.ensureQueryData(query);
};
