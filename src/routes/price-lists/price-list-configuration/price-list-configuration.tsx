import { RouteDrawer } from '@components/modals';
import { useCustomerGroups, usePriceList } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { PriceListConfigurationForm } from '@routes/price-lists/price-list-configuration/components/price-list-configuration-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const PriceListConfiguration = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { price_list, isPending, isError, error } = usePriceList(id!);

  const customerGroupIds = price_list?.rules?.['customer.groups.id'] as string[] | undefined;

  const {
    customer_groups,
    isPending: isCustomerGroupsPending,
    isError: isCustomerGroupsError,
    error: customerGroupsError
  } = useCustomerGroups(
    {
      id: customerGroupIds
    },
    { enabled: !!customerGroupIds?.length }
  );

  const initialCustomerGroups =
    customer_groups?.map(group => ({
      id: group.id,
      name: group.name!
    })) || [];

  const isCustomerGroupsReady = isPending
    ? false
    : !!customerGroupIds?.length && isCustomerGroupsPending
      ? false
      : true;

  const ready = !isPending && !!price_list && isCustomerGroupsReady;

  if (isError) {
    throw error;
  }

  if (isCustomerGroupsError) {
    throw customerGroupsError;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t('priceLists.configuration.edit.header')}</Heading>
        </RouteDrawer.Title>
      </RouteDrawer.Header>
      {ready && (
        <PriceListConfigurationForm
          priceList={price_list}
          customerGroups={initialCustomerGroups}
        />
      )}
    </RouteDrawer>
  );
};
