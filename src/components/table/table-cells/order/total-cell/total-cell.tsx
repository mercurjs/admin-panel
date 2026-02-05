import { MoneyAmountCell } from '@components/table/table-cells/common/money-amount-cell';
import { PlaceholderCell } from '@components/table/table-cells/common/placeholder-cell';
import { useTranslation } from 'react-i18next';

type TotalCellProps = {
  currencyCode: string;
  total: number | null;
};

export const TotalCell = ({ currencyCode, total }: TotalCellProps) => {
  if (!total) {
    return <PlaceholderCell />;
  }

  return (
    <MoneyAmountCell
      currencyCode={currencyCode}
      amount={total}
      align="right"
    />
  );
};

export const TotalHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center justify-end">
      <span className="truncate">{t('fields.total')}</span>
    </div>
  );
};
