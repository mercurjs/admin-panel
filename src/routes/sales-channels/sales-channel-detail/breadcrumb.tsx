import { useSalesChannel } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type SalesChannelDetailBreadcrumbProps = UIMatch<HttpTypes.AdminSalesChannelResponse>;

export const SalesChannelDetailBreadcrumb = (props: SalesChannelDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { sales_channel } = useSalesChannel(id!, {
    initialData: props.data,
    enabled: Boolean(id)
  });

  if (!sales_channel) {
    return null;
  }

  return <span>{sales_channel.name}</span>;
};
