import { createContext } from 'react';

import type { DashboardApp } from '@/dashboard-app';

type ExtensionContextValue = DashboardApp['api'];

export const ExtensionContext = createContext<ExtensionContextValue | null>(null);
