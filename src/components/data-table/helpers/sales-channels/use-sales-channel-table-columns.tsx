import { useMemo } from 'react';

import { DataTableStatusCell } from '@components/data-table/components';
import { useDataTableDateColumns } from '@components/data-table/helpers/general/use-data-table-date-columns.tsx';
import type { HttpTypes } from '@medusajs/types';
import { createDataTableColumnHelper, Tooltip } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

const columnHelper = createDataTableColumnHelper<HttpTypes.AdminSalesChannel>();

export const useSalesChannelTableColumns = () => {
  const { t } = useTranslation();
  const dateColumns = useDataTableDateColumns<HttpTypes.AdminSalesChannel>();

  return useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => t('fields.name'),
        enableSorting: true,
        sortLabel: t('fields.name'),
        sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
        sortDescLabel: t('filters.sorting.alphabeticallyDesc')
      }),
      columnHelper.accessor('description', {
        header: () => t('fields.description'),
        cell: ({ getValue }) => {
          return (
            <Tooltip content={getValue()}>
              <div className="flex h-full w-full items-center overflow-hidden">
                <span className="truncate">{getValue()}</span>
              </div>
            </Tooltip>
          );
        },
        enableSorting: true,
        sortLabel: t('fields.description'),
        sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
        sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
        maxSize: 250,
        minSize: 100
      }),
      columnHelper.accessor('is_disabled', {
        header: () => t('fields.status'),
        enableSorting: true,
        sortLabel: t('fields.status'),
        sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
        sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
        cell: ({ getValue }) => {
          const value = getValue();

          return (
            <DataTableStatusCell color={value ? 'grey' : 'green'}>
              {value ? t('general.disabled') : t('general.enabled')}
            </DataTableStatusCell>
          );
        }
      }),
      ...dateColumns
    ],
    [t, dateColumns]
  );
};
