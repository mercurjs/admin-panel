import { FetchError } from '@medusajs/js-sdk';
import { FindParams, HttpTypes, PaginatedResponse } from '@medusajs/types';
import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery
} from '@tanstack/react-query';
import { sdk } from '../../lib/client';
import { queryClient } from '../../lib/query-client';
import { queryKeysFactory } from '../../lib/query-key-factory';
import { productsQueryKeys } from './products';

const COLLECTION_QUERY_KEY = 'collections' as const;
export const collectionsQueryKeys = queryKeysFactory(COLLECTION_QUERY_KEY);

type AdminCollectionDetailMedia = {
  id: string;
  url: string;
  alt_text: string | null;
};

type AdminCollectionDetail = {
  id: string;
  media: AdminCollectionDetailMedia[];
  thumbnail_id: string | null;
  icon_id: string | null;
  banner_id: string | null;
  rank: number;
};

type AdminCollectionWithDetail = HttpTypes.AdminCollection & {
  collection_detail?: AdminCollectionDetail;
};

const retrieveCollectionWithDetails = async (id: string) => {
  const { collection } = await sdk.admin.productCollection.retrieve(id);

  try {
    const { collection_detail } = await sdk.client.fetch<{
      collection_detail: AdminCollectionDetail;
    }>(`/admin/collections/${id}/details`, {
      method: 'GET',
    });

    return {
      collection: {
        ...collection,
        collection_detail
      } as AdminCollectionWithDetail
    };
  } catch (error) {
    // A collection may not have details yet.
    if (error instanceof FetchError && error.status === 404) {
      return { collection: collection as AdminCollectionWithDetail };
    }

    throw error;
  }
};

export const usePostCollectionDetails = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: {
        media: { delete?: string[]; create?: { url: string; alt_text?: string }[] };
        thumbnail?: { url: string} | string | null;
        icon?: { url: string} | string |null;
        banner?: { url: string} | string| null;
        rank?: number | null;
      };
    }) =>
      sdk.client.fetch<{
        collection_detail: AdminCollectionDetail;
      }>(`/admin/collections/${id}/details`, {
        method: 'POST',
        body: payload
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.detail(variables.id) });
    }
  });
};

export const useCollection = (
  id: string,
  options?: Omit<
    UseQueryOptions<
      { collection: AdminCollectionWithDetail },
      FetchError,
      { collection: AdminCollectionWithDetail },
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: collectionsQueryKeys.detail(id),
    queryFn: async () => retrieveCollectionWithDetails(id),
    ...options
  });

  return { ...data, ...rest };
};

export const useCollections = (
  query?: FindParams & HttpTypes.AdminCollectionListParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedResponse<{ collections: HttpTypes.AdminCollection[] }>,
      FetchError,
      PaginatedResponse<{ collections: HttpTypes.AdminCollection[] }>,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: collectionsQueryKeys.list(query),
    queryFn: async () => sdk.admin.productCollection.list(query),
    ...options
  });

  return { ...data, ...rest };
};

export const useUpdateCollection = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminCollectionResponse,
    FetchError,
    HttpTypes.AdminUpdateCollection
  >
) => {
  return useMutation({
    mutationFn: payload => sdk.admin.productCollection.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: collectionsQueryKeys.detail(id)
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useUpdateCollectionProducts = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminCollectionResponse,
    FetchError,
    HttpTypes.AdminUpdateCollectionProducts
  >
) => {
  return useMutation({
    mutationFn: payload => sdk.admin.productCollection.updateProducts(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: collectionsQueryKeys.detail(id)
      });
      /**
       * Invalidate products list query to ensure that the products collections are updated.
       */
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.lists()
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useCreateCollection = (
  options?: UseMutationOptions<
    HttpTypes.AdminCollectionResponse,
    FetchError,
    HttpTypes.AdminCreateCollection
  >
) => {
  return useMutation({
    mutationFn: payload => sdk.admin.productCollection.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.lists() });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useDeleteCollection = (
  id: string,
  options?: UseMutationOptions<HttpTypes.AdminCollectionDeleteResponse, FetchError, void>
) => {
  return useMutation({
    mutationFn: () => sdk.admin.productCollection.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: collectionsQueryKeys.detail(id)
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
