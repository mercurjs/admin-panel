import { RequestStatus } from '@custom-types/requests';
import { useQueryParams } from '@hooks/use-query-params';

type UseRequestTableQueryProps = {
  prefix?: string;
  pageSize?: number;
};

type AdminRequestProductFilters = {
  limit: number;
  offset: number;
  q?: string;
  order?: string;
  created_at?: string;
  status?: RequestStatus[];
  seller_id?: string[];
};

export const useRequestProductTableQuery = ({
  prefix,
  pageSize = 20
}: UseRequestTableQueryProps) => {
  const queryObject = useQueryParams(
    ['offset', 'q', 'order', 'created_at', 'status', 'seller_id'],
    prefix
  );

  const { offset, q, order, created_at, status, seller_id } = queryObject;

  const searchParams: AdminRequestProductFilters = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    created_at: created_at ? JSON.parse(created_at) : undefined,
    seller_id: seller_id?.split(','),
    status: status?.split(',') as RequestStatus[],
    order,
    q
  };

  return {
    searchParams,
    raw: queryObject
  };
};
