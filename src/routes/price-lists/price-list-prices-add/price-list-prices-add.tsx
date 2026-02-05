import { RouteFocusModal } from '@components/modals';
import { usePriceList } from '@hooks/api';
import { usePriceListCurrencyData } from '@routes/price-lists/common/hooks/use-price-list-currency-data.tsx';
import { PriceListPricesAddForm } from '@routes/price-lists/price-list-prices-add/components/price-list-prices-add-form';
import { useParams } from 'react-router-dom';

export const PriceListProductsAdd = () => {
  const { id } = useParams<{ id: string }>();

  const { price_list, isPending, isError, error } = usePriceList(id!);
  const currencyData = usePriceListCurrencyData();

  const ready = currencyData.isReady && !isPending && !!price_list;

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal>
      {ready && (
        <PriceListPricesAddForm
          priceList={price_list}
          {...currencyData}
        />
      )}
    </RouteFocusModal>
  );
};
