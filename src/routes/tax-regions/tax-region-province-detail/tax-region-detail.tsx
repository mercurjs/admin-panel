import { SingleColumnPageSkeleton } from '@components/common/skeleton';
import { SingleColumnPage } from '@components/layout/pages';
import { useTaxRegion } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { TaxRegionProvinceDetailSection } from '@routes/tax-regions/tax-region-province-detail/components/tax-region-province-detail-section';
import { TaxRegionProvinceOverrideSection } from '@routes/tax-regions/tax-region-province-detail/components/tax-region-province-override-section';
import type { taxRegionLoader } from '@routes/tax-regions/tax-region-province-detail/loader';
import { useLoaderData, useParams } from 'react-router-dom';

export const TaxRegionDetail = () => {
  const { province_id } = useParams();

  const initialData = useLoaderData() as Awaited<ReturnType<typeof taxRegionLoader>>;

  const {
    tax_region: taxRegion,
    isLoading,
    isError,
    error
  } = useTaxRegion(province_id!, undefined, { initialData });

  const { getWidgets } = useExtension();

  if (isLoading || !taxRegion) {
    return (
      <SingleColumnPageSkeleton
        sections={2}
        showJSON
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <SingleColumnPage
      data={taxRegion}
      showJSON
      widgets={{
        after: getWidgets('tax.details.after'),
        before: getWidgets('tax.details.before')
      }}
    >
      <TaxRegionProvinceDetailSection taxRegion={taxRegion} />
      <TaxRegionProvinceOverrideSection taxRegion={taxRegion} />
    </SingleColumnPage>
  );
};
