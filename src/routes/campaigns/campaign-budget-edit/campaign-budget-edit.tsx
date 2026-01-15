import { RouteDrawer } from '@components/modals';
import { useCampaign } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { EditCampaignBudgetForm } from '@routes/campaigns/campaign-budget-edit/components/edit-campaign-budget-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const CampaignBudgetEdit = () => {
  const { t } = useTranslation();

  const { id } = useParams();
  const { campaign, isLoading, isError, error } = useCampaign(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t('campaigns.budget.edit.header')}</Heading>
        </RouteDrawer.Title>
      </RouteDrawer.Header>

      {!isLoading && campaign && <EditCampaignBudgetForm campaign={campaign} />}
    </RouteDrawer>
  );
};
