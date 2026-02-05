import { RouteDrawer } from '@components/modals';
import { usePromotion } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { EditPromotionDetailsForm } from '@routes/promotions/promotion-edit-details/components/edit-promotion-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const PromotionEditDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { promotion, isLoading, isError, error } = usePromotion(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t('promotions.edit.title')}</Heading>
      </RouteDrawer.Header>

      {!isLoading && promotion && <EditPromotionDetailsForm promotion={promotion} />}
    </RouteDrawer>
  );
};
