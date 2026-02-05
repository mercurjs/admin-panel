import { FetchError } from '@medusajs/js-sdk';

// @todo fix any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isFetchError = (error: any): error is FetchError => error instanceof FetchError;
