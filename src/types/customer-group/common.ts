import type { AdminCustomerGroup, PaginatedResponse } from '@medusajs/types';

export type AdminCustomerGroupListResponse = PaginatedResponse<{
  customer_groups: AdminCustomerGroup[];
}>;
