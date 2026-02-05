import { createContext } from 'react';

import type { KeybindContextState } from './types';

export const KeybindContext = createContext<KeybindContextState | null>(null);
