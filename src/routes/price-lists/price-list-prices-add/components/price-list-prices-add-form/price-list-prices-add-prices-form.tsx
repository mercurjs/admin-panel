import { useEffect } from 'react';

import { DataGrid } from '@components/data-grid';
import { useRouteModal } from '@components/modals';
import { useProducts } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import { usePriceListGridColumns } from '@routes/price-lists/common/hooks/use-price-list-grid-columns';
import type { PriceListCreateProductVariantsSchema } from '@routes/price-lists/common/schemas';
import { isProductRow } from '@routes/price-lists/common/utils';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import type { PriceListPricesAddSchema } from './schema';

type PriceListPricesAddPricesFormProps = {
  form: UseFormReturn<PriceListPricesAddSchema>;
  currencies: HttpTypes.AdminStoreCurrency[];
  regions: HttpTypes.AdminRegion[];
  pricePreferences: HttpTypes.AdminPricePreference[];
};

export const PriceListPricesAddPricesForm = ({
  form,
  currencies,
  regions,
  pricePreferences
}: PriceListPricesAddPricesFormProps) => {
  const ids = useWatch({
    control: form.control,
    name: 'product_ids'
  });

  const existingProducts = useWatch({
    control: form.control,
    name: 'products'
  });

  const { products, isLoading, isError, error } = useProducts({
    id: ids.map(id => id.id),
    limit: ids.length,
    fields: 'title,thumbnail,*variants'
  });

  const { setValue } = form;

  const { setCloseOnEscape } = useRouteModal();

  useEffect(() => {
    if (!isLoading && products) {
      products.forEach(product => {
        /**
         * If the product already exists in the form, we don't want to overwrite it.
         */
        if (existingProducts[product.id] || !product.variants) {
          return;
        }

        setValue(`products.${product.id}.variants`, {
          ...product.variants.reduce((variants, variant) => {
            variants[variant.id] = {
              currency_prices: {},
              region_prices: {}
            };

            return variants;
          }, {} as PriceListCreateProductVariantsSchema)
        });
      });
    }
  }, [products, existingProducts, isLoading, setValue]);

  const columns = usePriceListGridColumns({
    currencies,
    regions,
    pricePreferences
  });

  if (isError) {
    throw error;
  }

  return (
    <div className="flex size-full flex-col divide-y overflow-hidden">
      <DataGrid
        isLoading={isLoading}
        columns={columns}
        data={products}
        getSubRows={row => {
          if (isProductRow(row) && row.variants) {
            return row.variants;
          }
        }}
        state={form}
        onEditingChange={editing => setCloseOnEscape(!editing)}
      />
    </div>
  );
};
