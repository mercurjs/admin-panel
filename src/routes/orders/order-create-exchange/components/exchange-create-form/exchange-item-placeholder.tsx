import { Tag } from '@medusajs/icons';
import { clx } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

import { NoRecords } from '../../../../../components/common/empty-table-content';

type ExchangeItemPlaceholderProps = {
  type?: 'inbound' | 'outbound';
  hasError?: boolean;
};

export const ExchangeItemPlaceholder = ({
  type = 'outbound',
  hasError = false
}: ExchangeItemPlaceholderProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={clx('mt-4 rounded-lg border bg-ui-bg-base', {
        'border-ui-border-error': hasError,
        'border-ui-border-base': !hasError
      })}
    >
      <NoRecords
        icon={<Tag className="text-ui-fg-muted" />}
        title={t('orders.exchanges.noAddedItems')}
        message={
          type === 'inbound'
            ? t('orders.exchanges.noAddedItemsHintInbound')
            : t('orders.exchanges.noAddedItemsHintOutbound')
        }
        className="py-12"
      />
    </div>
  );
};
