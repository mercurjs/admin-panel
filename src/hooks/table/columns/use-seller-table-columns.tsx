import { useMemo } from 'react';

import { SellerStatusBadge } from '@components/common/seller-status-badge';
import { formatDate } from '@lib/date';
import { createColumnHelper } from '@tanstack/react-table';

import type { VendorSeller } from '@/types';

const columnHelper = createColumnHelper<VendorSeller>();

export const useSellersTableColumns = () =>
  useMemo(
    () => [
      columnHelper.display({
        id: 'email',
        header: 'Email',
        cell: ({ row }) => row.original.email
      }),
      columnHelper.display({
        id: 'name',
        header: 'Name',
        cell: ({ row }) => row.original.name
      }),
      columnHelper.display({
        id: 'store_status',
        header: 'Account Status',
        cell: ({ row }) => <SellerStatusBadge status={row.original.store_status || '-'} />
      }),
      columnHelper.display({
        id: 'created_at',
        header: 'Created',
        cell: ({ row }) => formatDate(row.original.created_at)
      })
    ],
    []
  );
