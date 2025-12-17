import { useQueryParams } from "../../use-query-params"
import type { AdminRefundReasonListParams } from "@custom-types/refund-reasons"

type UseRefundReasonTableQueryProps = {
  prefix?: string
  pageSize?: number
}

export const useRefundReasonTableQuery = ({
  prefix,
  pageSize = 20,
}: UseRefundReasonTableQueryProps) => {
  const queryObject = useQueryParams(
    ["offset", "q", "order", "created_at", "updated_at"],
    prefix
  )

  const { offset, q, order, created_at, updated_at } = queryObject
  const searchParams: AdminRefundReasonListParams = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    order,
    created_at: created_at ? JSON.parse(created_at) : undefined,
    updated_at: updated_at ? JSON.parse(updated_at) : undefined,
    q,
  }

  return {
    searchParams,
    raw: queryObject,
  }
}