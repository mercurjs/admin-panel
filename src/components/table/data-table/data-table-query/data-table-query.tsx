import type { ReactNode } from 'react';

import { DataTableFilter } from '@components/table/data-table/data-table-filter';
import {
  DataTableOrderBy,
  type DataTableOrderByKey
} from '@components/table/data-table/data-table-order-by';
import { DataTableSearch } from '@components/table/data-table/data-table-search';

import type { Filter } from '..';

export interface DataTableQueryProps<TData> {
  search?: boolean | 'autofocus';
  orderBy?: DataTableOrderByKey<TData>[];
  filters?: Filter[];
  prefix?: string;
  filterBarContent?: ReactNode;
}

export const DataTableQuery = <TData,>({
  search,
  orderBy,
  filters,
  prefix,
  filterBarContent
}: DataTableQueryProps<TData>) => {
  return (
    (search || orderBy || filters || prefix || filterBarContent) && (
      <div
        className="flex items-start justify-between gap-x-4 px-6 py-4"
        data-testid="data-table-query"
      >
        <div
          className="flex w-full max-w-[60%] items-center gap-2"
          data-testid="data-table-filters-container"
        >
          {filters && filters.length > 0 && (
            <DataTableFilter
              filters={filters}
              prefix={prefix}
            />
          )}
          {filterBarContent}
        </div>
        <div
          className="flex shrink-0 items-center gap-x-2"
          data-testid="data-table-search-order-container"
        >
          {search && (
            <DataTableSearch
              prefix={prefix}
              autofocus={search === 'autofocus'}
            />
          )}
          {orderBy && (
            <DataTableOrderBy
              keys={orderBy}
              prefix={prefix}
            />
          )}
        </div>
      </div>
    )
  );
};
