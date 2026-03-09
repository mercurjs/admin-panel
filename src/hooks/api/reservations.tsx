import type { FetchError } from '@medusajs/js-sdk';
import type { HttpTypes } from '@medusajs/types';
import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query';

import { sdk } from '../../lib/client';
import { queryClient } from '../../lib/query-client';
import { queryKeysFactory } from '../../lib/query-key-factory';
import { inventoryItemLevelsQueryKeys, inventoryItemsQueryKeys } from './inventory.tsx';

const RESERVATION_ITEMS_QUERY_KEY = 'reservation_items' as const;
export const reservationItemsQueryKeys = queryKeysFactory(RESERVATION_ITEMS_QUERY_KEY);

export const useReservationItem = (
  id: string,
  query?: HttpTypes.AdminReservationParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminReservationResponse,
      FetchError,
      HttpTypes.AdminReservationResponse,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: reservationItemsQueryKeys.detail(id),
    queryFn: async () => sdk.admin.reservation.retrieve(id, query),
    ...options
  });

  return { ...data, ...rest };
};

export const useReservationItems = (
  query?: HttpTypes.AdminGetReservationsParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminGetReservationsParams,
      FetchError,
      HttpTypes.AdminReservationListResponse,
      QueryKey
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.reservation.list(query),
    queryKey: reservationItemsQueryKeys.list(query),
    ...options
  });

  return { ...data, ...rest };
};

export const useUpdateReservationItem = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminReservationResponse,
    FetchError,
    HttpTypes.AdminUpdateReservation
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminUpdateReservation) =>
      sdk.admin.reservation.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useCreateReservationItem = (
  options?: UseMutationOptions<
    HttpTypes.AdminReservationResponse,
    FetchError,
    HttpTypes.AdminCreateReservation
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminCreateReservation) =>
      sdk.admin.reservation.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useBatchReservationItems = (
  options?: UseMutationOptions<
    {
      created: HttpTypes.AdminReservation[];
      updated: HttpTypes.AdminReservation[];
      deleted: string[];
    },
    FetchError,
    {
      create?: HttpTypes.AdminCreateReservation[];
      update?: Array<{
        id: string;
        location_id?: string;
        quantity?: number;
        description?: string;
        metadata?: object;
      }>;
      delete?: string[];
    }
  >
) => {
  return useMutation({
    mutationFn: payload =>
      sdk.client.fetch('/admin/reservations/batch', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.details()
      });
    },
    ...options
  });
};

export const useDeleteReservationItem = (
  id: string,
  options?: UseMutationOptions<HttpTypes.AdminReservationDeleteResponse, FetchError, void>
) => {
  return useMutation({
    mutationFn: () => sdk.admin.reservation.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
