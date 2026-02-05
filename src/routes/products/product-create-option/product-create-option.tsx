import { RouteDrawer } from '@components/modals';
import { useProduct } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { CreateProductOptionForm } from '@routes/products/product-create-option/components/create-product-option-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const ProductCreateOption = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { product, isLoading, isError, error } = useProduct(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t('products.options.create.header')}</Heading>
      </RouteDrawer.Header>
      {!isLoading && product && <CreateProductOptionForm product={product} />}
    </RouteDrawer>
  );
};
