import { usePromotion } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type PromotionDetailBreadcrumbProps = UIMatch<HttpTypes.AdminPromotionResponse>;

export const PromotionDetailBreadcrumb = (props: PromotionDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { promotion } = usePromotion(id!, {
    initialData: props.data,
    enabled: Boolean(id)
  });

  if (!promotion) {
    return null;
  }

  return <span>{promotion.code}</span>;
};
