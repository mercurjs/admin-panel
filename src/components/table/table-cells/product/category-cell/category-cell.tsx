import type { HttpTypes } from '@medusajs/types';
import { useTranslation } from 'react-i18next';

import { PlaceholderCell } from '@components/table/table-cells/common/placeholder-cell';

type CategoryCellProps = {
  category?: HttpTypes.AdminProductCategory | null;
  'data-testid'?: string;
};

export const CategoryCell = ({ category, 'data-testid': dataTestId }: CategoryCellProps) => {
  if (!category) {
    return <PlaceholderCell />;
  }

  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <span
        className="truncate"
        data-testid={dataTestId}
      >
        {category.name}
      </span>
    </div>
  );
};

export const CategoryHeader = () => {
  const { t } = useTranslation();

  return (
    <div
      className="flex h-full w-full items-center"
      data-testid="products-table-header-category"
    >
      <span data-testid="products-table-header-category-text">{t('fields.category')}</span>
    </div>
  );
};
