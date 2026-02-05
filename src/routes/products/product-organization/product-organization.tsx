import { RouteDrawer } from '@components/modals';
import { useProduct } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { PRODUCT_DETAIL_FIELDS } from '@routes/products/product-detail/constants';
import { ProductOrganizationForm } from '@routes/products/product-organization/components/product-organization-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const ProductOrganization = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { product, isLoading, isError, error } = useProduct(id!, {
    fields: PRODUCT_DETAIL_FIELDS
  });

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer data-testid="product-organization-drawer">
      <RouteDrawer.Header data-testid="product-organization-drawer-header">
        <RouteDrawer.Title
          asChild
          data-testid="product-organization-drawer-title"
        >
          <Heading data-testid="product-organization-drawer-title-text">
            {t('products.organization.edit.header')}
          </Heading>
        </RouteDrawer.Title>
      </RouteDrawer.Header>
      {!isLoading && product && <ProductOrganizationForm product={product} />}
    </RouteDrawer>
  );
};
