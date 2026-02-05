import { RouteDrawer } from '@components/modals';
import { VisuallyHidden } from '@components/utilities/visually-hidden';
import { useApiKey } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { EditApiKeyForm } from '@routes/api-key-management/api-key-management-edit/components/edit-api-key-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const ApiKeyManagementEdit = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { api_key, isLoading, isError, error } = useApiKey(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer data-testid={`${api_key?.type || 'api'}-api-key-edit-drawer`}>
      <RouteDrawer.Header data-testid={`${api_key?.type || 'api'}-api-key-edit-drawer-header`}>
        <RouteDrawer.Title asChild>
          <Heading data-testid={`${api_key?.type || 'api'}-api-key-edit-drawer-title`}>
            {t('apiKeyManagement.edit.header')}
          </Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description asChild>
          <VisuallyHidden data-testid={`${api_key?.type || 'api'}-api-key-edit-drawer-description`}>
            {t('apiKeyManagement.edit.description')}
          </VisuallyHidden>
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      {!isLoading && !!api_key && <EditApiKeyForm apiKey={api_key} />}
    </RouteDrawer>
  );
};
