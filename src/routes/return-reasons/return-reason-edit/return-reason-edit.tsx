import { RouteDrawer } from '@components/modals';
import { useReturnReason } from '@hooks/api/return-reasons';
import { Heading } from '@medusajs/ui';
import { ReturnReasonEditForm } from '@routes/return-reasons/return-reason-edit/components/return-reason-edit-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const ReturnReasonEdit = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { return_reason, isPending, isError, error } = useReturnReason(id!);

  const ready = !isPending && !!return_reason;

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer data-testid="return-reason-edit-drawer">
      <RouteDrawer.Header data-testid="return-reason-edit-drawer-header">
        <RouteDrawer.Title asChild>
          <Heading data-testid="return-reason-edit-drawer-heading">
            {t('returnReasons.edit.header')}
          </Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t('returnReasons.edit.subtitle')}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      {ready && <ReturnReasonEditForm returnReason={return_reason} />}
    </RouteDrawer>
  );
};
