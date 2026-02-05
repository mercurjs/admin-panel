import { RouteFocusModal } from '@components/modals';
import { usePriceListCurrencyData } from '@routes/price-lists/common/hooks/use-price-list-currency-data';
import { PriceListCreateForm } from '@routes/price-lists/price-list-create/components/price-list-create-form';

export const PriceListCreate = () => {
  const { isReady, regions, currencies, pricePreferences } = usePriceListCurrencyData();

  return (
    <RouteFocusModal>
      {isReady && (
        <PriceListCreateForm
          regions={regions}
          currencies={currencies}
          pricePreferences={pricePreferences}
        />
      )}
    </RouteFocusModal>
  );
};
