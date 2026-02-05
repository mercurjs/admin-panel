import { useTaxRegion } from '@hooks/api';
import { getCountryByIso2 } from '@lib/data/countries';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type TaxRegionDetailBreadcrumbProps = UIMatch<HttpTypes.AdminTaxRegionResponse>;

export const TaxRegionDetailBreadcrumb = (props: TaxRegionDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { tax_region } = useTaxRegion(id!, undefined, {
    initialData: props.data,
    enabled: Boolean(id)
  });

  if (!tax_region) {
    return null;
  }

  return (
    <span>
      {getCountryByIso2(tax_region.country_code)?.display_name ||
        tax_region.country_code?.toUpperCase()}
    </span>
  );
};
