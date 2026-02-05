import { PlaceholderCell } from '@components/table/table-cells/common/placeholder-cell';
import { useTranslation } from 'react-i18next';

type DescriptionCellProps = {
  description?: string | null;
};

export const DescriptionCell = ({ description }: DescriptionCellProps) => {
  if (!description) {
    return <PlaceholderCell />;
  }

  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <span className="truncate">{description}</span>
    </div>
  );
};

export const DescriptionHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center">
      <span className="truncate">{t('fields.description')}</span>
    </div>
  );
};
