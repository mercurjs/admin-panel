import { useMemo } from 'react';

import { useDataTableDateFilters } from '@components/data-table/helpers/general/use-data-table-date-filters';
import type { HttpTypes } from '@medusajs/types';
import { createDataTableFilterHelper } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

const filterHelper = createDataTableFilterHelper<HttpTypes.AdminSalesChannel>();

export const useSalesChannelTableFilters = () => {
  const { t } = useTranslation();
  const dateFilters = useDataTableDateFilters();

  return useMemo(
    () => [
      filterHelper.accessor('is_disabled', {
        label: t('fields.status'),
        type: 'radio',
        options: [
          {
            label: t('general.enabled'),
            value: 'false'
          },
          {
            label: t('general.disabled'),
            value: 'true'
          }
        ]
      }),
      ...dateFilters
    ],
    [dateFilters, t]
  );
};
