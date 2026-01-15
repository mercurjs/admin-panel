import { TwoColumnPageSkeleton } from '@components/common/skeleton';
import { TwoColumnPage } from '@components/layout/pages';
import { useCampaign } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { CampaignBudget } from '@routes/campaigns/campaign-detail/components/campaign-budget';
import { CampaignConfigurationSection } from '@routes/campaigns/campaign-detail/components/campaign-configuration-section';
import { CampaignGeneralSection } from '@routes/campaigns/campaign-detail/components/campaign-general-section';
import { CampaignPromotionSection } from '@routes/campaigns/campaign-detail/components/campaign-promotion-section';
import { CampaignSpend } from '@routes/campaigns/campaign-detail/components/campaign-spend';
import { useLoaderData, useParams } from 'react-router-dom';

import { CAMPAIGN_DETAIL_FIELDS } from './constants';
import type { campaignLoader } from './loader';

export const CampaignDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof campaignLoader>>;

  const { id } = useParams();
  const { campaign, isLoading, isError, error } = useCampaign(
    id!,
    { fields: CAMPAIGN_DETAIL_FIELDS },
    { initialData }
  );

  const { getWidgets } = useExtension();

  if (isLoading || !campaign) {
    return (
      <TwoColumnPageSkeleton
        mainSections={2}
        sidebarSections={3}
        showJSON
        showMetadata
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <TwoColumnPage
      widgets={{
        after: getWidgets('campaign.details.after'),
        before: getWidgets('campaign.details.before'),
        sideAfter: getWidgets('campaign.details.side.after'),
        sideBefore: getWidgets('campaign.details.side.before')
      }}
      hasOutlet
      showJSON
      showMetadata
      data={campaign}
    >
      <TwoColumnPage.Main>
        <CampaignGeneralSection campaign={campaign} />
        <CampaignPromotionSection campaign={campaign} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <CampaignConfigurationSection campaign={campaign} />
        <CampaignSpend campaign={campaign} />
        <CampaignBudget campaign={campaign} />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  );
};
