import { RouteFocusModal } from '@components/modals';
import { CreateLocationForm } from '@routes/locations/location-create/components/create-location-form';

export const LocationCreate = () => (
  <RouteFocusModal data-testid="location-create-modal">
    <CreateLocationForm />
  </RouteFocusModal>
);
