import { productsQueryKeys } from '@hooks/api';
import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import type { LoaderFunctionArgs } from 'react-router-dom';

import { PRODUCT_DETAIL_FIELDS } from './constants';

const productDetailQuery = (id: string) => ({
  queryKey: productsQueryKeys.detail(id, { fields: PRODUCT_DETAIL_FIELDS }),
  queryFn: async () => sdk.admin.product.retrieve(id, { fields: PRODUCT_DETAIL_FIELDS })
});

export const productLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = productDetailQuery(id!);

  return await queryClient.ensureQueryData({
    ...query,
    staleTime: 90000
  });
};
