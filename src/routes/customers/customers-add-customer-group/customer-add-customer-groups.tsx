import { RouteFocusModal } from '@components/modals';
import { AddCustomerGroupsForm } from '@routes/customers/customers-add-customer-group/components/add-customers-form';
import { useParams } from 'react-router-dom';

export const CustomerAddCustomerGroups = () => {
  const { id } = useParams();

  return (
    <RouteFocusModal>
      <AddCustomerGroupsForm customerId={id!} />
    </RouteFocusModal>
  );
};
