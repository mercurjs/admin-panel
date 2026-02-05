import { ActionMenu } from '@components/common/action-menu';
import { PencilSquare, Trash } from '@medusajs/icons';
import type { HttpTypes } from '@medusajs/types';
import { useDeleteProductTypeAction } from '@routes/product-types/common/hooks/use-delete-product-type-action';
import { useTranslation } from 'react-i18next';

type ProductTypeRowActionsProps = {
  productType: HttpTypes.AdminProductType;
};

export const ProductTypeRowActions = ({ productType }: ProductTypeRowActionsProps) => {
  const { t } = useTranslation();
  const handleDelete = useDeleteProductTypeAction(productType.id, productType.value);

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              label: t('actions.edit'),
              icon: <PencilSquare />,
              to: `/settings/product-types/${productType.id}/edit`
            }
          ]
        },
        {
          actions: [
            {
              label: t('actions.delete'),
              icon: <Trash />,
              onClick: handleDelete
            }
          ]
        }
      ]}
      data-testid={`product-type-list-table-action-menu-${productType.id}`}
    />
  );
};
