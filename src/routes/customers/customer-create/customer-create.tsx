import { RouteFocusModal } from '@components/modals';
import { CreateCustomerForm } from '@routes/customers/customer-create/components/create-customer-form';

export const CustomerCreate = () => (
  <RouteFocusModal>
    <CreateCustomerForm />
  </RouteFocusModal>
);
