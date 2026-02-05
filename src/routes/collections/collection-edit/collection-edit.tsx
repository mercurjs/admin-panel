import { RouteDrawer } from '@components/modals';
import { useCollection } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { EditCollectionForm } from '@routes/collections/collection-edit/components/edit-collection-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const CollectionEdit = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { collection, isLoading, isError, error } = useCollection(id!);

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t('collections.editCollection')}</Heading>
      </RouteDrawer.Header>
      {!isLoading && collection && <EditCollectionForm collection={collection} />}
    </RouteDrawer>
  );
};
