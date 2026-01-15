import { SingleColumnPageSkeleton } from '@components/common/skeleton';
import { SingleColumnPage } from '@components/layout/pages';
import { useCustomerGroup } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { CustomerGroupCustomerSection } from '@routes/customer-groups/customer-group-detail/components/customer-group-customer-section';
import { CustomerGroupGeneralSection } from '@routes/customer-groups/customer-group-detail/components/customer-group-general-section';
import { useLoaderData, useParams } from 'react-router-dom';

import { CUSTOMER_GROUP_DETAIL_FIELDS } from './constants';
import type { customerGroupLoader } from './loader';

export const CustomerGroupDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof customerGroupLoader>>;

  const { id } = useParams();
  const { customer_group, isLoading, isError, error } = useCustomerGroup(
    id!,
    {
      fields: CUSTOMER_GROUP_DETAIL_FIELDS
    },
    { initialData }
  );

  const { getWidgets } = useExtension();

  if (isLoading || !customer_group) {
    return (
      <SingleColumnPageSkeleton
        sections={2}
        showJSON
        showMetadata
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets('customer_group.details.before'),
        after: getWidgets('customer_group.details.after')
      }}
      showJSON
      showMetadata
      data={customer_group}
    >
      <CustomerGroupGeneralSection group={customer_group} />
      <CustomerGroupCustomerSection group={customer_group} />
    </SingleColumnPage>
  );
};
