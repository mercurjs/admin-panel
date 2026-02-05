import { RouteDrawer } from '@components/modals';
import { useUser } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { EditUserForm } from '@routes/users/user-edit/components/edit-user-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const UserEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user, isPending: isLoading, isError, error } = useUser(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer data-testid="user-edit">
      <RouteDrawer.Header data-testid="user-edit-header">
        <Heading data-testid="user-edit-heading">{t('users.editUser')}</Heading>
      </RouteDrawer.Header>
      {!isLoading && user && <EditUserForm user={user} />}
    </RouteDrawer>
  );
};
