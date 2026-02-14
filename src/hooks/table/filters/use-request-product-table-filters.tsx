import { useSellers } from '@hooks/api/sellers';
import { useTranslation } from 'react-i18next';

import type { Filter } from '../../../components/table/data-table';

export const useRequestProductTableFilters = (): Filter[] => {
  const { t } = useTranslation();

  const { sellers } = useSellers({
    limit: 1000,
    fields: 'id,name'
  });

  let filters: Filter[] = [];

  if (sellers) {
    const vendorFilter: Filter = {
      key: 'seller_id',
      label: t('fields.vendor'),
      type: 'select',
      options: sellers.map(s => ({
        label: s.name,
        value: s.id
      })),
      multiple: true,
      searchable: true
    };

    filters = [vendorFilter];
  }

  const statusFilter: Filter = {
    key: 'status',
    label: t('fields.status'),
    type: 'select',
    options: [
      { label: t('requests.status.pending'), value: 'pending' },
      { label: t('requests.status.accepted'), value: 'accepted' },
      { label: t('requests.status.rejected'), value: 'rejected' },
      { label: t('requests.status.draft'), value: 'draft' }
    ],
    multiple: true
  };

  const createdAtFilter: Filter = {
    key: 'created_at',
    label: t('fields.createdAt'),
    type: 'date'
  };

  return [...filters, statusFilter, createdAtFilter];
};
