import { ActionMenu } from '@components/common/action-menu';
import { PencilSquare, Trash } from '@medusajs/icons';
import type { HttpTypes } from '@medusajs/types';
import { Container, Heading } from '@medusajs/ui';
import { useDeleteProductTypeAction } from '@routes/product-types/common/hooks/use-delete-product-type-action.tsx';
import { useTranslation } from 'react-i18next';

type ProductTypeGeneralSectionProps = {
  productType: HttpTypes.AdminProductType;
};

export const ProductTypeGeneralSection = ({ productType }: ProductTypeGeneralSectionProps) => {
  const { t } = useTranslation();
  const handleDelete = useDeleteProductTypeAction(productType.id, productType.value);

  return (
    <Container
      className="flex items-center justify-between"
      data-testid="product-type-general-section-container"
    >
      <Heading data-testid="product-type-general-section-heading">{productType.value}</Heading>
      <ActionMenu
        groups={[
          {
            actions: [
              {
                label: t('actions.edit'),
                icon: <PencilSquare />,
                to: 'edit'
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
        data-testid="product-type-general-section-action-menu"
      />
    </Container>
  );
};
