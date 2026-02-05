import { TwoColumnPageSkeleton } from '@components/common/skeleton';
import { TwoColumnPage } from '@components/layout/pages';
import { useInventoryItem, useReservationItem } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { InventoryItemGeneralSection } from '@routes/inventory/inventory-detail/components/inventory-item-general-section.tsx';
import { ReservationGeneralSection } from '@routes/reservations/reservation-detail/components/reservation-general-section';
import { useLoaderData, useParams } from 'react-router-dom';

import type { reservationItemLoader } from './loader';

export const ReservationDetail = () => {
  const { id } = useParams();

  const initialData = useLoaderData() as Awaited<ReturnType<typeof reservationItemLoader>>;

  const { reservation, isLoading, isError, error } = useReservationItem(id!, undefined, {
    initialData
  });

  // TEMP: fetch directly since the fields are not populated with reservation call
  const { inventory_item } = useInventoryItem(reservation?.inventory_item?.id!, undefined, {
    enabled: !!reservation?.inventory_item?.id!
  });

  const { getWidgets } = useExtension();

  if (isLoading || !reservation) {
    return (
      <TwoColumnPageSkeleton
        mainSections={1}
        sidebarSections={1}
        showJSON
        showMetadata
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <TwoColumnPage
      widgets={{
        before: getWidgets('reservation.details.before'),
        after: getWidgets('reservation.details.after'),
        sideBefore: getWidgets('reservation.details.side.before'),
        sideAfter: getWidgets('reservation.details.side.after')
      }}
      data={reservation}
      showJSON
      showMetadata
    >
      <TwoColumnPage.Main>
        <ReservationGeneralSection reservation={reservation} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        {inventory_item && <InventoryItemGeneralSection inventoryItem={inventory_item} />}
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  );
};
