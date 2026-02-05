import { useProductType } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type ProductTypeDetailBreadcrumbProps = UIMatch<HttpTypes.AdminProductTypeResponse>;

export const ProductTypeDetailBreadcrumb = (props: ProductTypeDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { product_type } = useProductType(id!, undefined, {
    initialData: props.data,
    enabled: Boolean(id)
  });

  if (!product_type) {
    return null;
  }

  return <span>{product_type.value}</span>;
};
