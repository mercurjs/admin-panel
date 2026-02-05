import { ActionMenu } from '@components/common/action-menu';
import { Buildings } from '@medusajs/icons';
import type { InventoryItemDTO } from '@medusajs/types';
import { useTranslation } from 'react-i18next';

export const InventoryActions = ({ item }: { item: InventoryItemDTO }) => {
  const { t } = useTranslation();

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <Buildings />,
              label: t('products.variant.inventory.navigateToItem'),
              to: `/inventory/${item.id}`
            }
          ]
        }
      ]}
    />
  );
};
