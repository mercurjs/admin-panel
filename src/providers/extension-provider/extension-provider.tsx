import type { PropsWithChildren } from 'react';

import type { DashboardApp } from '@/dashboard-app';

import { ExtensionContext } from './extension-context';

type ExtensionProviderProps = PropsWithChildren<{
  api: DashboardApp['api'];
}>;

export const ExtensionProvider = ({ api, children }: ExtensionProviderProps) => (
  <ExtensionContext.Provider value={api}>{children}</ExtensionContext.Provider>
);
