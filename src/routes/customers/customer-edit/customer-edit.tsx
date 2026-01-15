import { RouteDrawer } from '@components/modals';
import { useCustomer } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { EditCustomerForm } from '@routes/customers/customer-edit/components/edit-customer-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const CustomerEdit = () => {
  const { t } = useTranslation();

  const { id } = useParams();
  const { customer, isLoading, isError, error } = useCustomer(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t('customers.edit.header')}</Heading>
      </RouteDrawer.Header>
      {!isLoading && customer && <EditCustomerForm customer={customer} />}
    </RouteDrawer>
  );
};
