import { RouteFocusModal } from '@components/modals';
import { CreatePromotionForm } from '@routes/promotions/promotion-create/components/create-promotion-form/create-promotion-form';

export const PromotionCreate = () => (
  <RouteFocusModal>
    <CreatePromotionForm />
  </RouteFocusModal>
);
