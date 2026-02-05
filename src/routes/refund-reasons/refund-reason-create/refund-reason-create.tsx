import { RouteFocusModal } from '@components/modals';
import { RefundReasonCreateForm } from '@routes/refund-reasons/refund-reason-create/components/refund-reason-create-form';

export const RefundReasonCreate = () => {
  return (
    <RouteFocusModal data-testid="refund-reason-create-modal">
      <RefundReasonCreateForm />
    </RouteFocusModal>
  );
};
