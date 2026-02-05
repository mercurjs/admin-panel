import { PlaceholderCell } from '@components/table/table-cells/common/placeholder-cell';
import { useTranslation } from 'react-i18next';


export const DisplayIdCell = ({
  displayId,
  'data-testid': dataTestId
}: {
  displayId?: number | null;
  'data-testid'?: string;
}) => {
  if (!displayId) {
    return <PlaceholderCell />;
  }

  return (
    <div
      className="txt-compact-small flex h-full w-full items-center overflow-hidden text-ui-fg-subtle"
      data-testid={dataTestId}
    >
      <span
        className="truncate"
        data-testid={dataTestId ? `${dataTestId}-text` : undefined}
      >
        #{displayId}
      </span>
    </div>
  );
};

export const DisplayIdHeader = () => {
  const { t } = useTranslation();

  return (
    <div
      className="flex h-full w-full items-center"
      data-testid="data-table-header-display-id"
    >
      <span
        className="truncate"
        data-testid="data-table-header-display-id-text"
      >
        {t('fields.order')}
      </span>
    </div>
  );
};
