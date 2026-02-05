import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client.ts';
import type { FetchError } from '@medusajs/js-sdk';
import type { HttpTypes } from '@medusajs/types';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { inventoryItemsQueryKeys } from './inventory.tsx';
import { ordersQueryKeys } from './orders';
import { reservationItemsQueryKeys } from './reservations';

export const useCreateOrderEdit = (
  orderId: string,
  options?: UseMutationOptions<
    HttpTypes.AdminOrderEditPreviewResponse,
    FetchError,
    HttpTypes.AdminInitiateOrderEditRequest
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminInitiateOrderEditRequest) =>
      sdk.admin.orderEdit.initiateRequest(payload),
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useRequestOrderEdit = (
  id: string,
  options?: UseMutationOptions<HttpTypes.AdminOrderEditPreviewResponse, FetchError, void>
) => {
  return useMutation({
    mutationFn: () => sdk.admin.orderEdit.request(id),
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(id)
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lineItems(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useConfirmOrderEdit = (
  id: string,
  options?: UseMutationOptions<HttpTypes.AdminOrderEditPreviewResponse, FetchError, void>
) => {
  return useMutation({
    mutationFn: () => sdk.admin.orderEdit.confirm(id),
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(id)
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lineItems(id)
      });

      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists()
      });

      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.lists()
      });

      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details()
      });

      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useCancelOrderEdit = (
  orderId: string,
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: UseMutationOptions<any, FetchError, any>
) => {
  return useMutation({
    mutationFn: () => sdk.admin.orderEdit.cancelRequest(orderId),
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(orderId)
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lineItems(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useAddOrderEditItems = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminOrderEditPreviewResponse,
    FetchError,
    HttpTypes.AdminAddOrderEditItems
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminAddOrderEditItems) =>
      sdk.admin.orderEdit.addItems(id, payload),
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

/**
 * Update (quantity) of an item that was originally on the order.
 */
export const useUpdateOrderEditOriginalItem = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminOrderEditPreviewResponse,
    FetchError,
    HttpTypes.AdminUpdateOrderEditItem & { itemId: string }
  >
) => {
  return useMutation({
    mutationFn: ({
      itemId,
      ...payload
    }: HttpTypes.AdminUpdateOrderEditItem & { itemId: string }) => {
      return sdk.admin.orderEdit.updateOriginalItem(id, itemId, payload);
    },
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

/**
 * Update (quantity) of an item that was added to the order edit.
 */
export const useUpdateOrderEditAddedItem = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminOrderEditPreviewResponse,
    FetchError,
    HttpTypes.AdminUpdateOrderEditItem & { actionId: string }
  >
) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }: HttpTypes.AdminUpdateOrderEditItem & { actionId: string }) => {
      return sdk.admin.orderEdit.updateAddedItem(id, actionId, payload);
    },
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

/**
 * Remove item that was added to the edit.
 * To remove an original item on the order, set quantity to 0.
 */
export const useRemoveOrderEditItem = (
  id: string,
  options?: UseMutationOptions<HttpTypes.AdminOrderEditPreviewResponse, FetchError, string>
) => {
  return useMutation({
    mutationFn: (actionId: string) => sdk.admin.orderEdit.removeAddedItem(id, actionId),
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
