import type { Filter } from '@components/table/data-table';
import { useTranslation } from 'react-i18next';

export const useExchangeOutboundItemTableFilters = () => {
  const { t } = useTranslation();

  const filters: Filter[] = [
    {
      key: 'created_at',
      label: t('fields.createdAt'),
      type: 'date'
    },
    {
      key: 'updated_at',
      label: t('fields.updatedAt'),
      type: 'date'
    }
  ];

  return filters;
};
