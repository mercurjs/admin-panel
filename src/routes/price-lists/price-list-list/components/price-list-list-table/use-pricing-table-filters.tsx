import type { Filter } from '@components/table/data-table';
import { useTranslation } from 'react-i18next';

export const usePricingTableFilters = () => {
  const { t } = useTranslation();

  const filters: Filter[] = [
    { label: t('fields.createdAt'), key: 'starts_at', type: 'date' },
    { label: t('fields.updatedAt'), key: 'ends_at', type: 'date' }
  ];

  return filters;
};
