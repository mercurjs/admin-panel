import { Filter } from '..';
import { DataTableExpandAll } from '../data-table-expand-all';
import { DataTableFilter } from '../data-table-filter';
import { DataTableOrderBy, DataTableOrderByKey } from '../data-table-order-by';
import { DataTableSearch } from '../data-table-search';

export interface DataTableQueryProps<TData> {
  search?: boolean | 'autofocus';
  orderBy?: DataTableOrderByKey<TData>[];
  filters?: Filter[];
  prefix?: string;
  enableExpandAll?: boolean;
  isAllExpanded?: boolean;
  onToggleExpandAll?: () => void;
}

export const DataTableQuery = <TData,>({
  search,
  orderBy,
  filters,
  prefix,
  enableExpandAll,
  isAllExpanded,
  onToggleExpandAll
}: DataTableQueryProps<TData>) => {
  const hasQueryControls = search || orderBy || filters || prefix || enableExpandAll;
  const shouldShowExpandAll = enableExpandAll && onToggleExpandAll && isAllExpanded !== undefined;

  return (
    hasQueryControls && (
      <div
        className="flex items-start justify-between gap-x-4 px-6 py-4"
        data-testid="data-table-query"
      >
        <div
          className="w-full max-w-[60%]"
          data-testid="data-table-filters-container"
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
          {shouldShowExpandAll && (
            <DataTableExpandAll
              isAllExpanded={isAllExpanded}
              onToggleExpandAll={onToggleExpandAll}
            />
          )}
        </div>
      </div>
    )
  );
};
