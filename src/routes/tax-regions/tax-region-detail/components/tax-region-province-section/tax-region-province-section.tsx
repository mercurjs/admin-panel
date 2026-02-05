import { useTaxRegions } from '@hooks/api';
import { useTaxRegionTableQuery } from '@hooks/table/query';
import { getCountryProvinceObjectByIso2 } from '@lib/data/country-states';
import type { HttpTypes } from '@medusajs/types';
import { Container, Heading } from '@medusajs/ui';
import { TaxRegionTable } from '@routes/tax-regions/common/components/tax-region-table';
import { useTaxRegionTable } from '@routes/tax-regions/common/hooks/use-tax-region-table';
import { keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 10;
const PREFIX = 'p';

type TaxRateListProps = {
  taxRegion: HttpTypes.AdminTaxRegion;
  showSublevelRegions: boolean;
};

export const TaxRegionProvinceSection = ({ taxRegion, showSublevelRegions }: TaxRateListProps) => {
  const { t } = useTranslation();

  const { searchParams, raw } = useTaxRegionTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX
  });
  const { tax_regions, count, isPending, isError, error } = useTaxRegions(
    {
      ...searchParams,
      parent_id: taxRegion.id
    },
    {
      placeholderData: keepPreviousData
    }
  );

  const { table } = useTaxRegionTable({
    count,
    data: tax_regions,
    pageSize: PAGE_SIZE,
    prefix: PREFIX
  });

  const provinceObject = getCountryProvinceObjectByIso2(taxRegion.country_code!);

  if (!provinceObject && !showSublevelRegions && !taxRegion.children.length) {
    return null;
  }

  const type = provinceObject?.type || 'sublevel';

  if (isError) {
    throw error;
  }

  return (
    <Container
      className="divide-y p-0"
      data-testid="tax-region-province-section-container"
    >
      <TaxRegionTable
        variant="province"
        action={{ to: `provinces/create`, label: t('actions.create') }}
        table={table}
        isPending={isPending}
        queryObject={raw}
        count={count}
        data-testid="tax-region-province-section-table"
      >
        <Heading
          level="h2"
          data-testid="tax-region-province-section-heading"
        >
          {t(`taxRegions.${type}.header`)}
        </Heading>
      </TaxRegionTable>
    </Container>
  );
};
