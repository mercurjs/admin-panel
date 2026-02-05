import { ListSummary } from '@components/common/list-summary';
import { PlaceholderCell } from '@components/table/table-cells/common/placeholder-cell';
import { formatProvider } from '@lib/format-provider.ts';
import type { PaymentProviderDTO } from '@medusajs/types';
import { useTranslation } from 'react-i18next';

type PaymentProvidersCellProps = {
  paymentProviders?: PaymentProviderDTO[] | null;
};

export const PaymentProvidersCell = ({ paymentProviders }: PaymentProvidersCellProps) => {
  if (!paymentProviders || paymentProviders.length === 0) {
    return <PlaceholderCell />;
  }

  const displayValues = paymentProviders.map(p => formatProvider(p.id));

  return (
    <div className="flex size-full items-center overflow-hidden">
      <ListSummary list={displayValues} />
    </div>
  );
};

export const PaymentProvidersHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex size-full items-center overflow-hidden">
      <span className="truncate">{t('fields.paymentProviders')}</span>
    </div>
  );
};
