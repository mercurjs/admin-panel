import { RouteFocusModal } from '@components/modals';
import { OrganizeCategoryForm } from '@routes/categories/category-organize/components/organize-category-form/organize-category-form';

export const CategoryOrganize = () => (
  <RouteFocusModal>
    <OrganizeCategoryForm />
  </RouteFocusModal>
);
