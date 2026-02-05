import { RouteFocusModal } from '@components/modals';
import { useStockLocation } from '@hooks/api';
import { LocationEditSalesChannelsForm } from '@routes/locations/location-sales-channels/components/edit-sales-channels-form';
import { useParams } from 'react-router-dom';

export const LocationSalesChannels = () => {
  const { location_id } = useParams();
  const { stock_location, isPending, isError, error } = useStockLocation(location_id!, {
    fields: 'id,*sales_channels'
  });

  const ready = !isPending && !!stock_location;

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal data-testid="location-sales-channels-modal">
      {ready && <LocationEditSalesChannelsForm location={stock_location} />}
    </RouteFocusModal>
  );
};
