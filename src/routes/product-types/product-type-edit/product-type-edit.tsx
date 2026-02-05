import { RouteDrawer } from '@components/modals';
import { useProductType } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { EditProductTypeForm } from '@routes/product-types/product-type-edit/components/edit-product-type-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const ProductTypeEdit = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { product_type, isPending, isError, error } = useProductType(id!);

  const ready = !isPending && !!product_type;

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer data-testid="product-type-edit-drawer">
      <RouteDrawer.Header data-testid="product-type-edit-drawer-header">
        <Heading data-testid="product-type-edit-drawer-heading">
          {t('productTypes.edit.header')}
        </Heading>
      </RouteDrawer.Header>
      {ready && <EditProductTypeForm productType={product_type} />}
    </RouteDrawer>
  );
};
