import { sdk } from '@lib/client';
import { queryKeysFactory } from '@lib/query-key-factory';
import type { FetchError } from '@medusajs/js-sdk';
import type { HttpTypes } from '@medusajs/types';
import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';

const NOTIFICATION_QUERY_KEY = 'notification' as const;
export const notificationQueryKeys = queryKeysFactory(NOTIFICATION_QUERY_KEY);

export const useNotification = (
  id: string,
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminNotificationResponse,
      FetchError,
      HttpTypes.AdminNotificationResponse,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: notificationQueryKeys.detail(id),
    queryFn: async () => sdk.admin.notification.retrieve(id, query),
    ...options
  });

  return { ...data, ...rest };
};

export const useNotifications = (
  query?: HttpTypes.AdminNotificationListParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminNotificationListResponse,
      FetchError,
      HttpTypes.AdminNotificationListResponse,
      QueryKey
    >,
    'queryFn' | 'queryKey'
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.notification.list(query),
    queryKey: notificationQueryKeys.list(query),
    ...options
  });

  return { ...data, ...rest };
};
