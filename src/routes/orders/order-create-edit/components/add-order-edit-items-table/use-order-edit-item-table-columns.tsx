import { useMemo } from 'react';

import { PlaceholderCell } from '@components/table/table-cells/common/placeholder-cell';
import {
  CollectionCell,
  CollectionHeader
} from '@components/table/table-cells/product/collection-cell/collection-cell';
import { ProductCell, ProductHeader } from '@components/table/table-cells/product/product-cell';
import { Checkbox } from '@medusajs/ui';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<any>();

export const useOrderEditItemsTableColumns = (currencyCode: string) => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsSomePageRowsSelected()
                  ? 'indeterminate'
                  : table.getIsAllPageRowsSelected()
              }
              onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            />
          );
        },
        cell: ({ row }) => {
          const isSelectable = row.getCanSelect();

          return (
            <Checkbox
              disabled={!isSelectable}
              checked={row.getIsSelected()}
              onCheckedChange={value => row.toggleSelected(!!value)}
              onClick={e => {
                e.stopPropagation();
              }}
            />
          );
        }
      }),
      columnHelper.display({
        id: 'product',
        header: () => <ProductHeader />,
        cell: ({ row }) => {
          return <ProductCell product={row.original.product} />;
        }
      }),
      columnHelper.accessor('title', {
        header: t('fields.variant')
      }),
      columnHelper.accessor('sku', {
        header: t('fields.sku'),
        cell: ({ getValue }) => {
          return getValue() || '-';
        }
      }),
      columnHelper.display({
        id: 'category',
        header: () => t('fields.category'),
        cell: ({ row }) => {
          const category = row.original.product?.categories?.[0];
          if (!category) {
            return <PlaceholderCell />;
          }

          return (
            <div className="flex h-full w-full items-center overflow-hidden">
              <span className="truncate">{category.name}</span>
            </div>
          );
        }
      }),
      columnHelper.display({
        id: 'collection',
        header: () => <CollectionHeader />,
        cell: ({ row }) => {
          return <CollectionCell collection={row.original.product?.collection} />;
        }
      })
    ],
    [t, currencyCode]
  );
};
