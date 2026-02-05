import type { HttpTypes } from '@medusajs/types';
import { Badge, Container, Tooltip } from '@medusajs/ui';
import { TaxRateLine } from '@routes/tax-regions/common/components/tax-rate-line';
import { TaxRegionCard } from '@routes/tax-regions/common/components/tax-region-card';
import { useTranslation } from 'react-i18next';

type TaxRegionDetailSectionProps = {
  taxRegion: HttpTypes.AdminTaxRegion;
};

export const TaxRegionDetailSection = ({ taxRegion }: TaxRegionDetailSectionProps) => {
  const { t } = useTranslation();

  const defaultRates = taxRegion.tax_rates.filter(r => r.is_default);
  const showBadge = defaultRates.length === 0;

  return (
    <Container
      className="divide-y p-0"
      data-testid="tax-region-detail-section-container"
    >
      <TaxRegionCard
        taxRegion={taxRegion}
        type="header"
        asLink={false}
        badge={
          showBadge && (
            <Tooltip content={t('taxRegions.fields.noDefaultRate.tooltip')}>
              <Badge
                color="orange"
                size="2xsmall"
                className="cursor-default"
                data-testid="tax-region-detail-section-no-default-rate-badge"
              >
                {t('taxRegions.fields.noDefaultRate.label')}
              </Badge>
            </Tooltip>
          )
        }
      />
      {defaultRates.map(rate => (
        <TaxRateLine
          key={rate.id}
          taxRate={rate}
        />
      ))}
    </Container>
  );
};
