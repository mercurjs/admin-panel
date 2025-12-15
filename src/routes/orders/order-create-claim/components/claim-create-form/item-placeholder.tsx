import { Tag } from '@medusajs/icons';
import { useTranslation } from 'react-i18next';

import { NoRecords } from '@components/common/empty-table-content';

type ItemPlaceholderProps = {
  type?: 'inbound' | 'outbound';
};

export const ItemPlaceholder = ({ type = 'outbound' }: ItemPlaceholderProps) => {
  const { t } = useTranslation();

  return (
    <div className="mt-4 rounded-lg border border-ui-border-base bg-ui-bg-base">
      <NoRecords
        icon={<Tag className="text-ui-fg-muted" />}
        title={t('orders.claims.noAddedItems')}
        message={
          type === 'inbound'
            ? t('orders.claims.noAddedItemsHintInbound')
            : t('orders.claims.noAddedItemsHintOutbound')
        }
        className="py-12"
      />
    </div>
  );
};
