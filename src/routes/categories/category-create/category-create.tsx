import { RouteFocusModal } from '@components/modals';
import { CreateCategoryForm } from '@routes/categories/category-create/components/create-category-form';
import { useSearchParams } from 'react-router-dom';

export const CategoryCreate = () => {
  const [searchParams] = useSearchParams();

  const parentCategoryId = searchParams.get('parent_category_id');

  return (
    <RouteFocusModal>
      <CreateCategoryForm parentCategoryId={parentCategoryId} />
    </RouteFocusModal>
  );
};
