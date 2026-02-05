import type { AttributeDTO } from '@custom-types/attribute';
import type { HttpTypes, PaginatedResponse } from '@medusajs/types';

export interface AdminProduct extends HttpTypes.AdminProduct {
  attribute_values?: AttributeDTO[];
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
  tag_id?: string | string[];
}
