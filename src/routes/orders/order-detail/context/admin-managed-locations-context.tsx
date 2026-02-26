import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';

import { getReturnableQuantity } from '@lib/rma';
import type { AdminOrder } from '@medusajs/types';

type VariantManagedBy = 'vendor' | 'admin' | 'both' | 'none';

export type AdminManagedLocationsContextValue = {
  adminLocationIds: Set<string>;
  canAdminActOnLocation: (locationId: string | undefined) => boolean;
  canAdminActOnOrder: boolean;
  canAdminActOnItem: (item: unknown) => boolean;
};

export const AdminManagedLocationsContext = createContext<AdminManagedLocationsContextValue | null>(
  null
);

export function useAdminManagedLocations(): AdminManagedLocationsContextValue {
  const value = useContext(AdminManagedLocationsContext);
  if (!value) {
    throw new Error('useAdminManagedLocations must be used within AdminManagedLocationsProvider');
  }

  return value;
}

type AdminManagedLocationsProviderProps = PropsWithChildren<{
  stockLocations: { id: string }[];
  order: AdminOrder | null | undefined;
}>;

export function AdminManagedLocationsProvider({
  stockLocations,
  order,
  children
}: AdminManagedLocationsProviderProps) {
  const adminLocationIds = useMemo(
    () => new Set(stockLocations.map(loc => loc.id)),
    [stockLocations]
  );

  const canAdminActOnLocation = useCallback(
    (locationId: string | undefined): boolean => !!locationId && adminLocationIds.has(locationId),
    [adminLocationIds]
  );

  const canAdminActOnItem = useCallback((item: unknown) => {
    const managedBy = (item as { variant_managed_by?: VariantManagedBy }).variant_managed_by;

    return managedBy === 'admin' || managedBy === 'both';
  }, []);

  const canAdminActOnOrder = useMemo(() => {
    const returnableItems = (order?.items ?? []).filter(i => getReturnableQuantity(i) > 0);
    if (returnableItems.length === 0) return true;

    return returnableItems.some(canAdminActOnItem);
  }, [order?.items, canAdminActOnItem]);

  const value = useMemo<AdminManagedLocationsContextValue>(
    () => ({
      adminLocationIds,
      canAdminActOnLocation,
      canAdminActOnOrder,
      canAdminActOnItem
    }),
    [adminLocationIds, canAdminActOnLocation, canAdminActOnOrder, canAdminActOnItem]
  );

  return (
    <AdminManagedLocationsContext.Provider value={value}>
      {children}
    </AdminManagedLocationsContext.Provider>
  );
}
