import { useProductTag } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type ProductTagDetailBreadcrumbProps = UIMatch<HttpTypes.AdminProductTagResponse>;

export const ProductTagDetailBreadcrumb = (props: ProductTagDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { product_tag } = useProductTag(id!, undefined, {
    initialData: props.data,
    enabled: Boolean(id)
  });

  if (!product_tag) {
    return null;
  }

  return <span>{product_tag.value}</span>;
};
