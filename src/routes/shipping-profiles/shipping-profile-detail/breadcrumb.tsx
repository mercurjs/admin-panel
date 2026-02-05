import { useShippingProfile } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type ShippingProfileDetailBreadcrumbProps = UIMatch<HttpTypes.AdminShippingProfileResponse>;

export const ShippingProfileDetailBreadcrumb = (props: ShippingProfileDetailBreadcrumbProps) => {
  const { shipping_profile_id } = props.params || {};

  const { shipping_profile } = useShippingProfile(shipping_profile_id!, undefined, {
    initialData: props.data,
    enabled: Boolean(shipping_profile_id)
  });

  if (!shipping_profile) {
    return null;
  }

  return <span>{shipping_profile.name}</span>;
};
