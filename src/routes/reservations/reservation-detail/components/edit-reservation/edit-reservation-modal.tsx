import { RouteDrawer } from '@components/modals';
import { useInventoryItem, useReservationItem, useStockLocations } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { EditReservationForm } from '@routes/reservations/reservation-detail/components/edit-reservation/components/edit-reservation-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const ReservationEdit = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { reservation, isPending, isError, error } = useReservationItem(id!);
  const { inventory_item: inventoryItem } = useInventoryItem(
    reservation?.inventory_item_id ?? '',
    undefined,
    {
      enabled: !!reservation?.inventory_item_id
    }
  );
  const { stock_locations } = useStockLocations(
    {
      id: inventoryItem?.location_levels?.map(level => level.location_id)
    },
    {
      enabled: !!inventoryItem?.location_levels
    }
  );

  const ready = !isPending && reservation && inventoryItem && stock_locations;
  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t('inventory.reservation.editItemDetails')}</Heading>
      </RouteDrawer.Header>
      {ready && (
        <EditReservationForm
          locations={stock_locations}
          reservation={reservation}
          item={inventoryItem}
        />
      )}
    </RouteDrawer>
  );
};
