import type { HttpTypes, PaginatedResponse, InventoryItemDTO, InventoryLevelDTO } from "@medusajs/types";

import type { AttributeDTO } from "@custom-types/attribute";

export interface AdminProduct extends HttpTypes.AdminProduct {
  attribute_values?: AttributeDTO[];
}

export interface InventoryItemWithLevels extends InventoryItemDTO {
  location_levels?: InventoryLevelDTO[];
}

export interface AdminProductVariantWithInventory extends HttpTypes.AdminProductVariant {
  inventory?: InventoryItemWithLevels[];
}

export interface AdminProductVariantListResponseWithInventory extends Omit<HttpTypes.AdminProductVariantListResponse, 'variants'> {
  variants: AdminProductVariantWithInventory[];
}

export interface AdminProductResponse {
  product: AdminProduct;
}

export interface AdminProductUpdate extends HttpTypes.AdminUpdateProduct {
  additional_data?: {
    values?: Record<string, string>[];
  };
}

export type AdminProductListResponse = PaginatedResponse<{
  products: AdminProduct[];
}>;

export interface ExtendedAdminProductListParams extends HttpTypes.AdminProductListParams {
  tag_id?: string | string[]
}