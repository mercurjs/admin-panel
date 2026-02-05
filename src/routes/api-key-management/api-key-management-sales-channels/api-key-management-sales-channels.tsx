import { RouteFocusModal } from '@components/modals';
import { useApiKey } from '@hooks/api';
import type { AdminApiKeyResponse, AdminSalesChannelResponse } from '@medusajs/types';
import { ApiKeySalesChannelsForm } from '@routes/api-key-management/api-key-management-sales-channels/components/api-key-sales-channels-form';
import { useParams } from 'react-router-dom';

export const ApiKeyManagementAddSalesChannels = () => {
  const { id } = useParams();

  const { api_key, isLoading, isError, error } = useApiKey(id!);

  const preSelected = (
    api_key as AdminApiKeyResponse['api_key'] & {
      sales_channels: AdminSalesChannelResponse['sales_channel'][] | null;
    }
  )?.sales_channels?.map(sc => sc.id);

  const ready = !isLoading && api_key;

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal data-testid="publishable-api-key-sales-channels-modal">
      {ready && (
        <ApiKeySalesChannelsForm
          apiKey={id!}
          preSelected={preSelected}
        />
      )}
    </RouteFocusModal>
  );
};
