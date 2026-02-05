import { RouteFocusModal } from '@components/modals';
import { useProductCategory } from '@hooks/api';
import { EditCategoryProductsForm } from '@routes/categories/category-products/components/edit-category-products-form';
import { useParams } from 'react-router-dom';

export const CategoryProducts = () => {
  const { id } = useParams();

  const { product_category, isPending, isFetching, isError, error } = useProductCategory(id!, {
    fields: 'products.id'
  });

  const ready = !isPending && !isFetching && !!product_category;

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal>
      {ready && (
        <EditCategoryProductsForm
          categoryId={product_category.id}
          products={product_category.products}
        />
      )}
    </RouteFocusModal>
  );
};
