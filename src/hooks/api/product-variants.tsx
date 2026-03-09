import { sdk } from '@lib/client';
import { queryKeysFactory } from '@lib/query-key-factory';
import type { FetchError } from '@medusajs/js-sdk';
import type { AdminProductVariant } from '@medusajs/types';
import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';

const PRODUCT_VARIANT_QUERY_KEY = 'product_variant' as const;
export const productVariantQueryKeys = queryKeysFactory(PRODUCT_VARIANT_QUERY_KEY);

export const useVariants = (
  query?: Record<string, any>,
  options?: Omit<UseQueryOptions<any, FetchError, any, QueryKey>, 'queryFn' | 'queryKey'>
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.productVariant.list(query),
    queryKey: productVariantQueryKeys.list(query),
    ...options
  });

  return { ...data, ...rest };
};

interface VariantsResponse {
  variants: AdminProductVariant[];
  count: number;
}

export const useCustomProductVariants = <TData = VariantsResponse,>(
  query?: Record<string, string | number | boolean | undefined | null>,
  options?: Omit<UseQueryOptions<VariantsResponse, Error, TData, QueryKey>, 'queryFn' | 'queryKey'>
) => {
  const { data, ...rest } = useQuery({
    queryKey: ['custom_product_variants', query],
    queryFn: async (): Promise<VariantsResponse> => {
      const searchParams = new URLSearchParams();

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            const valToAppend = typeof value === 'object' ? JSON.stringify(value) : String(value);
            searchParams.append(key, valToAppend);
          }
        });
      }

      const queryString = searchParams.toString();
      const url = `/admin/custom/product-variants${queryString ? `?${queryString}` : ''}`;

      return sdk.client.fetch(url);
    },
    ...options
  });

  const response = data as VariantsResponse | undefined;

  return {
    variants: response?.variants ?? [],
    count: response?.count ?? 0,
    ...rest
  };
};
