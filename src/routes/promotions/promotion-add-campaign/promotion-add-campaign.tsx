import { RouteDrawer } from '@components/modals';
import { usePromotion } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { AddCampaignPromotionForm } from '@routes/promotions/promotion-add-campaign/components/add-campaign-promotion-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const PromotionAddCampaign = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { promotion, isPending, isError, error } = usePromotion(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t('promotions.campaign.edit.header')}</Heading>
      </RouteDrawer.Header>

      {!isPending && promotion && <AddCampaignPromotionForm promotion={promotion} />}
    </RouteDrawer>
  );
};
