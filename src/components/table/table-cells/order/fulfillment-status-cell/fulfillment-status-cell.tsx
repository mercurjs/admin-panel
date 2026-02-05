import { StatusCell } from '@components/table/table-cells/common/status-cell';
import { getOrderFulfillmentStatus } from '@lib/order-helpers';
import type { FulfillmentStatus } from '@medusajs/types';
import { useTranslation } from 'react-i18next';

type FulfillmentStatusCellProps = {
  status: FulfillmentStatus;
};

export const FulfillmentStatusCell = ({ status }: FulfillmentStatusCellProps) => {
  const { t } = useTranslation();

  if (!status) {
    // TODO: remove this once fulfillment<>order link is added
    return '-';
  }

  const { label, color } = getOrderFulfillmentStatus(t, status);

  return <StatusCell color={color}>{label}</StatusCell>;
};

export const FulfillmentStatusHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center">
      <span className="truncate">{t('fields.fulfillment')}</span>
    </div>
  );
};
