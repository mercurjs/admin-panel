import { RouteFocusModal } from '@components/modals';
import { CreateShippingProfileForm } from '@routes/shipping-profiles/shipping-profile-create/components/create-shipping-profile-form';

export function ShippingProfileCreate() {
  return (
    <RouteFocusModal data-testid="shipping-profile-create-modal">
      <CreateShippingProfileForm />
    </RouteFocusModal>
  );
}
