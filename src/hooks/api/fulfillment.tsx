import { sdk } from '@lib/client';
import { queryClient } from '@lib/query-client';
import { queryKeysFactory } from '@lib/query-key-factory';
import type { FetchError } from '@medusajs/js-sdk';
import type { HttpTypes } from '@medusajs/types';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { ordersQueryKeys } from './orders';

const FULFILLMENTS_QUERY_KEY = 'fulfillments' as const;
export const fulfillmentsQueryKeys = queryKeysFactory(FULFILLMENTS_QUERY_KEY);

export const useCreateFulfillment = (
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: UseMutationOptions<any, FetchError, any>
) => {
  return useMutation({
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (payload: any) => sdk.admin.fulfillment.create(payload),
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: fulfillmentsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useCancelFulfillment = (
  id: string,
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: UseMutationOptions<any, FetchError, any>
) => {
  return useMutation({
    mutationFn: () => sdk.admin.fulfillment.cancel(id),
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: fulfillmentsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export const useCreateFulfillmentShipment = (
  fulfillmentId: string,
  options?: UseMutationOptions<
    { fulfillment: HttpTypes.AdminFulfillment },
    FetchError,
    HttpTypes.AdminCreateFulfillmentShipment
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminCreateFulfillmentShipment) =>
      sdk.admin.fulfillment.createShipment(fulfillmentId, payload),
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
