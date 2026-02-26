import { useMemo } from 'react';

import { CategoryCell, CategoryHeader } from '@components/table/table-cells/product/category-cell';
import {
  CollectionCell,
  CollectionHeader
} from '@components/table/table-cells/product/collection-cell';
import { ProductCell, ProductHeader } from '@components/table/table-cells/product/product-cell';
import { getStylizedAmount } from '@lib/money-amount-helpers';
import { Checkbox, Tooltip } from '@medusajs/ui';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<any>();

export const useReturnItemTableColumns = (
  currencyCode: string,
  getRowDisabledReason?: (item: any) => string | null
) => {
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
          const disabledReason = getRowDisabledReason?.(row.original) ?? null;
          const checkbox = (
            <Checkbox
              disabled={!isSelectable}
              checked={row.getIsSelected()}
              onCheckedChange={value => row.toggleSelected(!!value)}
              onClick={e => {
                e.stopPropagation();
              }}
            />
          );

          if (!isSelectable && disabledReason) {
            return (
              <Tooltip content={disabledReason}>
                <span className="inline-flex cursor-not-allowed">{checkbox}</span>
              </Tooltip>
            );
          }

          return checkbox;
        }
      }),
      columnHelper.display({
        id: 'product',
        header: () => <ProductHeader />,
        cell: ({ row }) => (
          <ProductCell
            product={{
              thumbnail: row.original.thumbnail,
              title: row.original.product_title
            }}
          />
        )
      }),
      columnHelper.display({
        id: 'variant_title',
        header: t('fields.variant'),
        cell: ({ row }) => {
          return row.original.variant_title || '-';
        }
      }),
      columnHelper.display({
        id: 'sku',
        header: t('fields.sku'),
        cell: ({ row }) => {
          return row.original.variant_sku || '-';
        }
      }),
      columnHelper.display({
        id: 'category',
        header: () => <CategoryHeader />,
        cell: ({ row }) => {
          const category = row.original.variant?.product?.categories?.[0] || null;

          return <CategoryCell category={category} />;
        }
      }),
      columnHelper.display({
        id: 'collection',
        header: () => <CollectionHeader />,
        cell: ({ row }) => {
          const collection = row.original.variant?.product?.collection || null;

          return <CollectionCell collection={collection} />;
        }
      }),
      columnHelper.accessor('refundable_total', {
        header: () => (
          <div className="flex size-full items-center overflow-hidden">
            <span className="truncate">{t('fields.price')}</span>
          </div>
        ),
        cell: ({ getValue }) => {
          const amount = getValue() || 0;

          const stylized = getStylizedAmount(amount, currencyCode);

          return (
            <div className="flex size-full items-center overflow-hidden">
              <span className="truncate">{stylized}</span>
            </div>
          );
        }
      })
    ],
    [t, currencyCode]
  );
};
