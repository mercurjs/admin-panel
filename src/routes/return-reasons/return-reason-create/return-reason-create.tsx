import { RouteFocusModal } from '@components/modals';
import { ReturnReasonCreateForm } from '@routes/return-reasons/return-reason-create/components/return-reason-create-form';

export const ReturnReasonCreate = () => (
  <RouteFocusModal data-testid="return-reason-create-modal">
    <ReturnReasonCreateForm />
  </RouteFocusModal>
);
