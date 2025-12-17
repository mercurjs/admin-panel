import type { HttpTypes, PaginatedResponse, InventoryItemDTO, InventoryLevelDTO } from "@medusajs/types";

import type { AttributeDTO } from "@custom-types/attribute";

export interface ExtendedAdminProductImage extends HttpTypes.AdminProductImage {
  url: string
}

export interface AdminPrice extends HttpTypes.AdminPrice {
  rules?: Record<string, string>;
}

export interface AdminProduct extends Omit<HttpTypes.AdminProduct, 'images'> {
  attribute_values?: AttributeDTO[];
  images: ExtendedAdminProductImage[] | null;
  shipping_profile?: HttpTypes.AdminShippingProfile | null;
}

export interface AdminProductVariantWithPriceRules extends Omit<HttpTypes.AdminProductVariant, 'prices'> {
  prices: AdminPrice[] | null;
}

export interface AdminProductWithPriceRules extends Omit<AdminProduct, 'variants'> {
  variants?: AdminProductVariantWithPriceRules[] | null;
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