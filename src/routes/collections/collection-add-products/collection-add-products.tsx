import { RouteFocusModal } from '@components/modals';
import { useCollection } from '@hooks/api';
import { AddProductsToCollectionForm } from '@routes/collections/collection-add-products/components/add-products-to-collection-form';
import { useParams } from 'react-router-dom';

export const CollectionAddProducts = () => {
  const { id } = useParams();
  const { collection, isLoading, isError, error } = useCollection(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal>
      {!isLoading && collection && <AddProductsToCollectionForm collection={collection} />}
    </RouteFocusModal>
  );
};
