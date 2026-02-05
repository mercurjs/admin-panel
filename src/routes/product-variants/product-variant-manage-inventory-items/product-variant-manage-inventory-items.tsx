import { RouteFocusModal } from '@components/modals';
import { useProductVariant } from '@hooks/api';
import { VARIANT_DETAIL_FIELDS } from '@routes/product-variants/product-variant-detail/constants';
import { ManageVariantInventoryItemsForm } from '@routes/product-variants/product-variant-manage-inventory-items/components/manage-variant-inventory-items-form';
import { useParams } from 'react-router-dom';

export function ProductVariantManageInventoryItems() {
  const { id, variant_id } = useParams();

  const {
    variant,
    isPending: isLoading,
    isError,
    error
  } = useProductVariant(id!, variant_id!, {
    fields: VARIANT_DETAIL_FIELDS
  });

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal>
      {!isLoading && variant && <ManageVariantInventoryItemsForm variant={variant} />}
    </RouteFocusModal>
  );
}
