import { SingleColumnPage } from '@components/layout/pages';
import { useExtension } from '@providers/extension-provider';
import { ApiKeyManagementListTable } from '@routes/api-key-management/api-key-management-list/components/api-key-management-list-table';
import { getApiKeyTypeFromPathname } from '@routes/api-key-management/common/utils.ts';
import { useLocation } from 'react-router-dom';

export const ApiKeyManagementList = () => {
  const { pathname } = useLocation();
  const { getWidgets } = useExtension();

  const keyType = getApiKeyTypeFromPathname(pathname);

  return (
    <SingleColumnPage
      hasOutlet
      widgets={{
        before: getWidgets('api_key.list.before'),
        after: getWidgets('api_key.list.after')
      }}
      data-testid="publishable-api-keys-list-page"
    >
      <ApiKeyManagementListTable keyType={keyType} />
    </SingleColumnPage>
  );
};
