import { useProductCategory } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type CategoryDetailBreadcrumbProps = UIMatch<HttpTypes.AdminProductCategoryResponse>;

export const CategoryDetailBreadcrumb = (props: CategoryDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { product_category } = useProductCategory(
    id!,
    {
      fields: 'name'
    },
    {
      initialData: props.data,
      enabled: Boolean(id)
    }
  );

  if (!product_category) {
    return null;
  }

  return <span>{product_category.name}</span>;
};
