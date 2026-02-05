import { RouteFocusModal } from '@components/modals';
import { TaxRegionCreateForm } from '@routes/tax-regions/tax-region-create/components/tax-region-create-form';

export const TaxRegionCreate = () => (
  <RouteFocusModal data-testid="tax-region-create-modal">
    <TaxRegionCreateForm />
  </RouteFocusModal>
);
