import { RouteFocusModal } from '@components/modals';
import { useCampaign } from '@hooks/api';
import { useParams } from 'react-router-dom';

import { AddCampaignPromotionsForm } from './components';

export const AddCampaignPromotions = () => {
  const { id } = useParams();
  const { campaign, isError, error } = useCampaign(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal>
      {campaign && <AddCampaignPromotionsForm campaign={campaign} />}
    </RouteFocusModal>
  );
};
