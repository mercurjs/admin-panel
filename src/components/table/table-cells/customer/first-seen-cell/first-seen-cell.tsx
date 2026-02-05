import { DateCell } from '@components/table/table-cells/common/date-cell';
import { PlaceholderCell } from '@components/table/table-cells/common/placeholder-cell';
import { useTranslation } from 'react-i18next';

type FirstSeenCellProps = {
  createdAt?: Date | string | null;
};

export const FirstSeenCell = ({ createdAt }: FirstSeenCellProps) => {
  if (!createdAt) {
    return <PlaceholderCell />;
  }

  return <DateCell date={createdAt} />;
};

export const FirstSeenHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center">
      <span className="truncate">{t('fields.createdAt')}</span>
    </div>
  );
};
