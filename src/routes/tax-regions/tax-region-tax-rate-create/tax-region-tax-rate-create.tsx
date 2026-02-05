import { RouteFocusModal } from '@components/modals';
import { useTaxRegion } from '@hooks/api';
import { TaxRegionTaxRateCreateForm } from '@routes/tax-regions/tax-region-tax-rate-create/components/tax-region-tax-rate-create-form';
import { useParams } from 'react-router-dom';

export const TaxRegionTaxRateCreate = () => {
  const { id, province_id } = useParams();

  const { tax_region, isPending, isError, error } = useTaxRegion(province_id || id!);

  const ready = !isPending && !!tax_region;

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal>
      {ready && (
        <TaxRegionTaxRateCreateForm
          taxRegion={tax_region}
          isSublevel={!!province_id}
        />
      )}
    </RouteFocusModal>
  );
};
