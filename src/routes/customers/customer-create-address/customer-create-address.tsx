import { RouteFocusModal } from '@components/modals';
import { CreateCustomerAddressForm } from '@routes/customers/customer-create-address/components/create-customer-address-form';

export const CustomerCreateAddress = () => (
  <RouteFocusModal>
    <CreateCustomerAddressForm />
  </RouteFocusModal>
);
