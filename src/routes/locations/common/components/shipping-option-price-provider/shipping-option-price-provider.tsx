import type { PropsWithChildren } from 'react';

import type { ConditionalPriceInfo } from '@routes/locations/common/types';

import { ShippingOptionPriceContext } from './shipping-option-price-context';

type ShippingOptionPriceProviderProps = PropsWithChildren<{
  onOpenConditionalPricesModal: (info: ConditionalPriceInfo) => void;
  onCloseConditionalPricesModal: () => void;
}>;

export const ShippingOptionPriceProvider = ({
  children,
  onOpenConditionalPricesModal,
  onCloseConditionalPricesModal
}: ShippingOptionPriceProviderProps) => {
  return (
    <ShippingOptionPriceContext.Provider
      value={{ onOpenConditionalPricesModal, onCloseConditionalPricesModal }}
    >
      {children}
    </ShippingOptionPriceContext.Provider>
  );
};
