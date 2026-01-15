import type { Filter } from '@components/table/data-table';
import { useTranslation } from 'react-i18next';

export const usePromotionTableFilters = () => {
  const { t } = useTranslation();

  const filters: Filter[] = [
    { label: t('fields.createdAt'), key: 'created_at', type: 'date' },
    { label: t('fields.updatedAt'), key: 'updated_at', type: 'date' }
  ];

  return filters;
};
