import { useEffect, useState } from 'react';

import { _DataTable } from '@components/table/data-table';
import { useCustomProductVariants } from '@hooks/api';
import { useDataTable } from '@hooks/use-data-table';
import type { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { useOrderEditItemsTableColumns } from './use-order-edit-item-table-columns';
import { useOrderEditItemTableFilters } from './use-order-edit-item-table-filters';
import { useOrderEditItemTableQuery } from './use-order-edit-item-table-query';

const PAGE_SIZE = 50;
const PREFIX = 'rit';

type AddExchangeOutboundItemsTableProps = {
  onSelectionChange: (ids: string[]) => void;
  currencyCode: string;
  sellerId?: string;
};

export const AddOrderEditItemsTable = ({
  onSelectionChange,
  currencyCode,
  sellerId
}: AddExchangeOutboundItemsTableProps) => {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const updater: OnChangeFn<RowSelectionState> = fn => {
    const newState: RowSelectionState = typeof fn === 'function' ? fn(rowSelection) : fn;

    setRowSelection(newState);
    onSelectionChange(Object.keys(newState));
  };

  useEffect(() => {
    const orderParam = `${PREFIX}_order`;
    setSearchParams(prev => {
      if (!prev.get(orderParam)) {
        const newParams = new URLSearchParams(prev);
        newParams.set(orderParam, 'product.title');

        return newParams;
      }

      return prev;
    });
  }, [setSearchParams]);

  const { searchParams, raw } = useOrderEditItemTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX
  });

  const { variants, count } = useCustomProductVariants({
    ...searchParams,
    fields:
      '*inventory_items.inventory.location_levels,+inventory_quantity,*product.categories,*product.collection',
    has_price: true,
    has_inventory: true,
    has_stock_location: true,
    ...(sellerId ? { seller_id: sellerId } : {})
  });

  const columns = useOrderEditItemsTableColumns(currencyCode);
  const filters = useOrderEditItemTableFilters();

  const { table } = useDataTable({
    data: variants,
    columns: columns,
    count,
    enablePagination: true,
    getRowId: row => row.id,
    pageSize: PAGE_SIZE,
    enableRowSelection: _row => {
      // TODO: Check inventory here. Check if other validations needs to be made
      return true;
    },
    rowSelection: {
      state: rowSelection,
      updater
    }
  });

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <_DataTable
        table={table}
        columns={columns}
        pageSize={PAGE_SIZE}
        count={count}
        filters={filters}
        pagination
        layout="fill"
        search
        orderBy={[
          { key: 'product.title', label: t('fields.product') },
          { key: 'title', label: t('fields.title') },
          { key: 'sku', label: t('fields.sku') }
        ]}
        prefix={PREFIX}
        queryObject={raw}
      />
    </div>
  );
};
