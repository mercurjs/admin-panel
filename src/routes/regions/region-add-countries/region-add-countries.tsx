import { RouteFocusModal } from '@components/modals';
import { useRegion } from '@hooks/api';
import { AddCountriesForm } from '@routes/regions/region-add-countries/components/add-countries-form';
import { useParams } from 'react-router-dom';

export const RegionAddCountries = () => {
  const { id } = useParams();

  const {
    region,
    isPending: isLoading,
    isError,
    error
  } = useRegion(id!, {
    fields: '*payment_providers'
  });

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal data-testid="region-add-countries-modal">
      {!isLoading && region && <AddCountriesForm region={region} />}
    </RouteFocusModal>
  );
};
