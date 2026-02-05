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
}

export const DataTableQuery = <TData,>({
  search,
  orderBy,
  filters,
  prefix
}: DataTableQueryProps<TData>) =>
  (search || orderBy || filters || prefix) && (
    <div
      className="flex items-start justify-between gap-x-4 px-6 py-4"
      data-testid="data-table-query"
    >
      <div
        className="w-full max-w-[60%]"
        data-testid="data-table-fil ters-container"
      >
        {filters && filters.length > 0 && (
          <DataTableFilter
            filters={filters}
            prefix={prefix}
          />
        )}
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
  );
