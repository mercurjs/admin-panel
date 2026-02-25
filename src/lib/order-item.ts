import { AdminOrderLineItem, AdminProductVariant, OrderLineItemDTO } from '@medusajs/types';

export const getFulfillableQuantity = (item: OrderLineItemDTO | AdminOrderLineItem) => {
  return item.quantity - item.detail.fulfilled_quantity;
};

export const canVariantBeFulfilledByAdmin = (
  variant?: AdminProductVariant,
  adminLocationIds?: Set<string>
): boolean => {
  if (!adminLocationIds || !variant) {
    return false;
  }

  const inventory = variant?.inventory?.[0];
  if (!inventory?.location_levels?.length) {
    return false;
  }

  return inventory.location_levels.some(
    level =>
      adminLocationIds.has(level.location_id) &&
      level.available_quantity &&
      level.available_quantity > 0
  );
};

export const filterItemsFulfillableByAdmin = (
  items: AdminOrderLineItem[],
  adminLocationIds: Set<string>
): AdminOrderLineItem[] => {
  return items.filter(item => canVariantBeFulfilledByAdmin(item.variant, adminLocationIds));
};
