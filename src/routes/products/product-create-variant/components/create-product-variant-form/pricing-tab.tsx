import { useMemo } from 'react';

import { createDataGridHelper, createDataGridPriceColumns, DataGrid } from '@components/data-grid';
import { useRouteModal } from '@components/modals';
import { useRegions, useStore } from '@hooks/api';
import { usePricePreferences } from '@hooks/api/price-preferences.tsx';
import type { HttpTypes } from '@medusajs/types';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import type { CreateProductVariantSchema } from './constants';

type PricingTabProps = {
  form: UseFormReturn<z.infer<typeof CreateProductVariantSchema>>;
};

function PricingTab({ form }: PricingTabProps) {
  const { store } = useStore();
  const { regions } = useRegions({ limit: 9999 });
  const { price_preferences: pricePreferences } = usePricePreferences({});

  const { setCloseOnEscape } = useRouteModal();

  const columns = useVariantPriceGridColumns({
    currencies: store?.supported_currencies,
    regions,
    pricePreferences
  });

  const variant = useWatch({
    control: form.control
    // @todo fix any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

  return (
    <div data-testid="product-variant-create-form-pricing-tab">
      <DataGrid
        columns={columns}
        data={[variant]}
        state={form}
        onEditingChange={editing => setCloseOnEscape(!editing)}
      />
    </div>
  );
}

const columnHelper = createDataGridHelper<
  HttpTypes.AdminProductVariant,
  z.infer<typeof CreateProductVariantSchema>
>();

const useVariantPriceGridColumns = ({
  currencies = [],
  regions = [],
  pricePreferences = []
}: {
  currencies?: HttpTypes.AdminStore['supported_currencies'];
  regions?: HttpTypes.AdminRegion[];
  pricePreferences?: HttpTypes.AdminPricePreference[];
}) => {
  const { t } = useTranslation();

  return useMemo(() => {
    return [
      columnHelper.column({
        id: t('fields.title'),
        header: t('fields.title'),
        cell: context => {
          const entity = context.row.original;

          return (
            <DataGrid.ReadonlyCell context={context}>
              <div className="flex h-full w-full items-center gap-x-2 overflow-hidden">
                <span className="truncate">{entity.title}</span>
              </div>
            </DataGrid.ReadonlyCell>
          );
        },
        disableHiding: true
      }),
      ...createDataGridPriceColumns<
        HttpTypes.AdminProductVariant,
        z.infer<typeof CreateProductVariantSchema>
      >({
        currencies: currencies.map(c => c.currency_code),
        regions,
        pricePreferences,
        getFieldName: (context, value) => {
          if (context.column.id?.startsWith('currency_prices')) {
            return `prices.${value}`;
          }

          return `prices.${value}`;
        },
        t
      })
    ];
  }, [t, currencies, regions, pricePreferences]);
};

export default PricingTab;
