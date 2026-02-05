import { StatusCell } from '@components/table/table-cells/common/status-cell';
import { getOrderPaymentStatus } from '@lib/order-helpers';
import type { HttpTypes } from '@medusajs/types';
import { useTranslation } from 'react-i18next';

type PaymentStatusCellProps = {
  status: HttpTypes.AdminOrder['payment_status'];
};

export const PaymentStatusCell = ({ status }: PaymentStatusCellProps) => {
  const { t } = useTranslation();

  const { label, color } = getOrderPaymentStatus(t, status);

  return <StatusCell color={color}>{label}</StatusCell>;
};

export const PaymentStatusHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="items-cente r flex h-full w-full">
      <span className="truncate">{t('fields.payment')}</span>
    </div>
  );
};
