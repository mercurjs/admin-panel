import { RouteFocusModal } from '@components/modals';
import { ReservationCreateForm } from '@routes/reservations/reservation-create/components/reservation-create-from';
import { useSearchParams } from 'react-router-dom';

export const ReservationCreate = () => {
  const [params] = useSearchParams();

  const inventoryItemId = params.get('item_id');

  return (
    <RouteFocusModal>
      <ReservationCreateForm inventoryItemId={inventoryItemId} />
    </RouteFocusModal>
  );
};
