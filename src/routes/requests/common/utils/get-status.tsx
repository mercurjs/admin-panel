import { StatusCell } from '@components/table/table-cells/common/status-cell';
import type { RequestStatus } from '@custom-types/requests';
import { TFunction } from 'i18next';

export const getRequestStatus = (t: TFunction<'translation'>, status: RequestStatus) => {
  const [label, color] = {
    pending: [t('requests.status.pending'), 'orange'],
    accepted: [t('requests.status.accepted'), 'green'],
    rejected: [t('requests.status.rejected'), 'red'],
    draft: [t('requests.status.draft'), 'grey']
  }[status] as [string, 'orange' | 'green' | 'red' | 'grey'];

  return <StatusCell color={color}>{label}</StatusCell>;
};
