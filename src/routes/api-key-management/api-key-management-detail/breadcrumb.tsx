import { useApiKey } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type ApiKeyManagementDetailBreadcrumbProps = UIMatch<HttpTypes.AdminApiKeyResponse>;

export const ApiKeyManagementDetailBreadcrumb = (props: ApiKeyManagementDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { api_key } = useApiKey(id!, {
    initialData: props.data,
    enabled: Boolean(id)
  });

  if (!api_key) {
    return null;
  }

  return <span>{api_key.title}</span>;
};
