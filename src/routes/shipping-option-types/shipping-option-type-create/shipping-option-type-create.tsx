import { RouteFocusModal } from '@components/modals';
import { CreateShippingOptionTypeForm } from '@routes/shipping-option-types/shipping-option-type-create/components/create-shipping-option-type-form';

export const ShippingOptionTypeCreate = () => (
  <RouteFocusModal data-testid="shipping-option-type-create-modal">
    <CreateShippingOptionTypeForm />
  </RouteFocusModal>
);
