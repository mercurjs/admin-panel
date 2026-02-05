import type { QueryKey, UseQueryOptions } from '@tanstack/react-query';

// @todo fix any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TQueryKey<TKey, TListQuery = any, TDetailQuery = string> = {
  all: readonly [TKey];
  lists: () => readonly [...TQueryKey<TKey>['all'], 'list'];
  list: (
    query?: TListQuery
  ) => readonly [...ReturnType<TQueryKey<TKey>['lists']>, { query: TListQuery }];
  details: () => readonly [...TQueryKey<TKey>['all'], 'detail'];
  detail: (
    id: TDetailQuery,
    query?: TListQuery
  ) => readonly [...ReturnType<TQueryKey<TKey>['details']>, TDetailQuery, { query: TListQuery }];
};

export type UseQueryOptionsWrapper<
  // Return type of queryFn
  TQueryFn = unknown,
  // Type thrown in case the queryFn rejects
  E = Error,
  // Query key type
  TQueryKey extends QueryKey = QueryKey
> = Omit<UseQueryOptions<TQueryFn, E, TQueryFn, TQueryKey>, 'queryKey' | 'queryFn'>;

export const queryKeysFactory = <
  T,
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TListQueryType = any,
  TDetailQueryType = string
>(
  globalKey: T
) => {
  const queryKeyFactory: TQueryKey<T, TListQueryType, TDetailQueryType> = {
    all: [globalKey],
    lists: () => [...queryKeyFactory.all, 'list'],
    list: (query?: TListQueryType) =>
      [...queryKeyFactory.lists(), query ? { query } : undefined].filter(k => !!k),
    details: () => [...queryKeyFactory.all, 'detail'],
    detail: (id: TDetailQueryType, query?: TListQueryType) =>
      [...queryKeyFactory.details(), id, query ? { query } : undefined].filter(k => !!k)
  };

  return queryKeyFactory;
};
