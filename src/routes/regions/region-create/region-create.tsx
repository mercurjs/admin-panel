import { RouteFocusModal } from '@components/modals';
import { useStore } from '@hooks/api';
import { currencies } from '@lib/data/currencies.ts';
import { CreateRegionForm } from '@routes/regions/region-create/components/create-region-form';

export const RegionCreate = () => {
  const { store, isPending: isLoading, isError, error } = useStore();

  const storeCurrencies = (store?.supported_currencies ?? []).map(
    c => currencies[c.currency_code.toUpperCase()]
  );

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal data-testid="region-create-modal">
      {!isLoading && store && <CreateRegionForm currencies={storeCurrencies} />}
    </RouteFocusModal>
  );
};
