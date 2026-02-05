import { usePriceList } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type PriceListDetailBreadcrumbProps = UIMatch<HttpTypes.AdminPriceListResponse>;

export const PriceListDetailBreadcrumb = (props: PriceListDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { price_list } = usePriceList(id!, undefined, {
    initialData: props.data,
    enabled: Boolean(id)
  });

  if (!price_list) {
    return null;
  }

  return <span>{price_list.title}</span>;
};
