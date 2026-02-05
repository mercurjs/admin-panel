import { RouteDrawer } from '@components/modals';
import { useRegion, useStore } from '@hooks/api';
import { usePricePreferences } from '@hooks/api/price-preferences';
import { currencies } from '@lib/data/currencies';
import { Heading } from '@medusajs/ui';
import { EditRegionForm } from '@routes/regions/region-edit/components/edit-region-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const RegionEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const {
    region,
    isPending: isRegionLoading,
    isError: isRegionError,
    error: regionError
  } = useRegion(id!, {
    fields: '*payment_providers,*countries,+automatic_taxes'
  });

  const { store, isPending: isStoreLoading, isError: isStoreError, error: storeError } = useStore();

  const {
    price_preferences: pricePreferences = [],
    isPending: isPreferenceLoading,
    isError: isPreferenceError,
    error: preferenceError
  } = usePricePreferences(
    {
      attribute: 'region_id',
      value: id
    },
    { enabled: !!region }
  );

  const isLoading = isRegionLoading || isStoreLoading || isPreferenceLoading;

  const storeCurrencies = (store?.supported_currencies ?? []).map(
    c => currencies[c.currency_code.toUpperCase()]
  );

  if (isRegionError) {
    throw regionError;
  }

  if (isStoreError) {
    throw storeError;
  }

  if (isPreferenceError) {
    throw preferenceError;
  }

  return (
    <RouteDrawer data-testid="region-edit-drawer">
      <RouteDrawer.Header data-testid="region-edit-drawer-header">
        <Heading data-testid="region-edit-drawer-heading">{t('regions.editRegion')}</Heading>
      </RouteDrawer.Header>
      {!isLoading && region && (
        <EditRegionForm
          region={region}
          currencies={storeCurrencies}
          pricePreferences={pricePreferences}
        />
      )}
    </RouteDrawer>
  );
};
