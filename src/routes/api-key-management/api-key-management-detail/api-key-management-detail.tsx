import { SingleColumnPageSkeleton } from '@components/common/skeleton';
import { SingleColumnPage } from '@components/layout/pages';
import { useApiKey } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { ApiKeyGeneralSection } from '@routes/api-key-management/api-key-management-detail/components/api-key-general-section';
import { ApiKeySalesChannelSection } from '@routes/api-key-management/api-key-management-detail/components/api-key-sales-channel-section';
import { ApiKeyType } from '@routes/api-key-management/common/constants.ts';
import { useLoaderData, useParams } from 'react-router-dom';

import type { apiKeyLoader } from './loader';

export const ApiKeyManagementDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof apiKeyLoader>>;

  const { id } = useParams();
  const { getWidgets } = useExtension();

  const { api_key, isLoading, isError, error } = useApiKey(id!, {
    initialData: initialData
  });

  if (isLoading || !api_key) {
    return (
      <SingleColumnPageSkeleton
        showJSON
        sections={1}
      />
    );
  }

  const isPublishable = api_key?.type === ApiKeyType.PUBLISHABLE;

  if (isError) {
    throw error;
  }

  return (
    <SingleColumnPage
      hasOutlet
      showJSON
      widgets={{
        before: getWidgets('api_key.details.before'),
        after: getWidgets('api_key.details.after')
      }}
      data={api_key}
      data-testid={`${api_key.type}-api-key-detail-page`}
    >
      <ApiKeyGeneralSection apiKey={api_key} />
      {isPublishable && <ApiKeySalesChannelSection apiKey={api_key} />}
    </SingleColumnPage>
  );
};
