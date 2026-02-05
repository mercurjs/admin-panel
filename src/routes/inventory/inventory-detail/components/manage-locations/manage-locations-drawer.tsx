import { RouteDrawer } from '@components/modals';
import { useInventoryItem, useStockLocations } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { ManageLocationsForm } from '@routes/inventory/inventory-detail/components/manage-locations/components/manage-locations-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const ManageLocationsDrawer = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const {
    inventory_item: inventoryItem,
    isPending: isLoading,
    isError,
    error
  } = useInventoryItem(id!);

  const { stock_locations, isLoading: loadingLocations } = useStockLocations();

  const ready = !isLoading && !loadingLocations && inventoryItem && stock_locations;

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer data-testid="inventory-manage-locations-drawer">
      <RouteDrawer.Header data-testid="inventory-manage-locations-drawer-header">
        <Heading data-testid="inventory-manage-locations-drawer-title">
          {t('inventory.manageLocations')}
        </Heading>
      </RouteDrawer.Header>
      {ready && (
        <ManageLocationsForm
          item={inventoryItem}
          locations={stock_locations}
        />
      )}
    </RouteDrawer>
  );
};
