import { createContext } from 'react';

import type { ConditionalPriceInfo } from '@routes/locations/common/types';

type ShippingOptionPriceContextType = {
  onOpenConditionalPricesModal: (info: ConditionalPriceInfo) => void;
  onCloseConditionalPricesModal: () => void;
};

export const ShippingOptionPriceContext = createContext<ShippingOptionPriceContextType | null>(
  null
);
