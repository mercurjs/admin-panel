import { SingleColumnPageSkeleton } from '@components/common/skeleton';
import { SingleColumnPage } from '@components/layout/pages';
import { useSalesChannel } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { SalesChannelGeneralSection } from '@routes/sales-channels/sales-channel-detail/components/sales-channel-general-section';
import { SalesChannelProductSection } from '@routes/sales-channels/sales-channel-detail/components/sales-channel-product-section';
import type { salesChannelLoader } from '@routes/sales-channels/sales-channel-detail/loader';
import { useLoaderData, useParams } from 'react-router-dom';

export const SalesChannelDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof salesChannelLoader>>;

  const { id } = useParams();
  const { sales_channel, isPending: isLoading } = useSalesChannel(id!, {
    initialData
  });

  const { getWidgets } = useExtension();

  if (isLoading || !sales_channel) {
    return (
      <SingleColumnPageSkeleton
        sections={2}
        showJSON
        showMetadata
      />
    );
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets('sales_channel.details.before'),
        after: getWidgets('sales_channel.details.after')
      }}
      showJSON
      showMetadata
      data={sales_channel}
    >
      <SalesChannelGeneralSection salesChannel={sales_channel} />
      <SalesChannelProductSection salesChannel={sales_channel} />
    </SingleColumnPage>
  );
};
