import { PlaceholderCell } from '@components/table/table-cells/common/placeholder-cell';
import type { HttpTypes } from '@medusajs/types';
import { useTranslation } from 'react-i18next';

type VariantCellProps = {
  variants?: HttpTypes.AdminProductVariant[] | null;
  'data-testid'?: string;
};

export const VariantCell = ({ variants, 'data-testid': dataTestId }: VariantCellProps) => {
  const { t } = useTranslation();

  if (!variants || !variants.length) {
    return <PlaceholderCell />;
  }

  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <span
        className="truncate"
        data-testid={dataTestId}
      >
        {t('products.variantCount', { count: variants.length })}
      </span>
    </div>
  );
};

export const VariantHeader = () => {
  const { t } = useTranslation();

  return (
    <div
      className="flex h-full w-full items-center"
      data-testid="products-table-header-variants"
    >
      <span data-testid="products-table-header-variants-text">{t('fields.variants')}</span>
    </div>
  );
};
