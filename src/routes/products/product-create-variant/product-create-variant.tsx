import { RouteFocusModal } from '@components/modals';
import { useProduct } from '@hooks/api';
import { CreateProductVariantForm } from '@routes/products/product-create-variant/components/create-product-variant-form';
import { useParams } from 'react-router-dom';

export const ProductCreateVariant = () => {
  const { id } = useParams();

  const { product, isLoading, isError, error } = useProduct(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal>
      {!isLoading && product && <CreateProductVariantForm product={product} />}
    </RouteFocusModal>
  );
};
