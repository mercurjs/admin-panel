import { RouteDrawer } from '@components/modals';
import { useStore } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { EditStoreForm } from '@routes/store/store-edit/components/edit-store-form/edit-store-form';
import { useTranslation } from 'react-i18next';

export const StoreEdit = () => {
  const { t } = useTranslation();
  const { store, isPending: isLoading, isError, error } = useStore();

  if (isError) {
    throw error;
  }

  const ready = !!store && !isLoading;

  return (
    <RouteDrawer data-testid="store-edit">
      <RouteDrawer.Header data-testid="store-edit-header">
        <Heading data-testid="store-edit-heading">{t('store.edit.header')}</Heading>
      </RouteDrawer.Header>
      {ready && <EditStoreForm store={store} />}
    </RouteDrawer>
  );
};
