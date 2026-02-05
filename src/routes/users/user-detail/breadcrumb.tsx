import { useUser } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type UserDetailBreadcrumbProps = UIMatch<HttpTypes.AdminUserResponse>;

export const UserDetailBreadcrumb = (props: UserDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { user } = useUser(id!, undefined, {
    initialData: props.data,
    enabled: Boolean(id)
  });

  if (!user) {
    return null;
  }

  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');

  const display = name || user.email;

  return <span>{display}</span>;
};
