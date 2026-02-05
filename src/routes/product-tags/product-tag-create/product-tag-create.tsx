import { RouteFocusModal } from '@components/modals';
import { ProductTagCreateForm } from '@routes/product-tags/product-tag-create/components/product-tag-create-form';

export const ProductTagCreate = () => (
  <RouteFocusModal data-testid="product-tag-create-modal">
    <ProductTagCreateForm />
  </RouteFocusModal>
);
