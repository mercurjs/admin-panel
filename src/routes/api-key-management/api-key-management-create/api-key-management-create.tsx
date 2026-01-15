import { RouteFocusModal } from '@components/modals';
import { ApiKeyCreateForm } from '@routes/api-key-management/api-key-management-create/components/api-key-create-form';
import { getApiKeyTypeFromPathname } from '@routes/api-key-management/common/utils.ts';
import { useLocation } from 'react-router-dom';

export const ApiKeyManagementCreate = () => {
  const { pathname } = useLocation();
  const keyType = getApiKeyTypeFromPathname(pathname);

  return (
    <RouteFocusModal data-testid={`${keyType}-api-key-create-modal`}>
      <ApiKeyCreateForm keyType={keyType} />
    </RouteFocusModal>
  );
};
