import { RouteDrawer } from '@components/modals';
import { usePriceList } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { PriceListEditForm } from '@routes/price-lists/price-list-edit/components/price-list-edit-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const PriceListEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { price_list, isLoading, isError, error } = usePriceList(id!);

  const ready = !isLoading && price_list;

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t('priceLists.edit.header')}</Heading>
      </RouteDrawer.Header>
      {ready && <PriceListEditForm priceList={price_list} />}
    </RouteDrawer>
  );
};
