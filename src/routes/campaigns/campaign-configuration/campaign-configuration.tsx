import { RouteDrawer } from '@components/modals';
import { useCampaign } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { CampaignConfigurationForm } from '@routes/campaigns/campaign-configuration/components/campaign-configuration-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const CampaignConfiguration = () => {
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
          <Heading>{t('campaigns.configuration.edit.header')}</Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t('campaigns.configuration.edit.description')}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      {!isLoading && campaign && <CampaignConfigurationForm campaign={campaign} />}
    </RouteDrawer>
  );
};
