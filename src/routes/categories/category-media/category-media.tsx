import { RouteFocusModal } from '@components/modals';
import { useProductCategory } from '@hooks/api';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CategoryMediaView } from './components/category-media-view/category-media-view';

export const CategoryMedia = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { product_category, isLoading, isError, error } = useProductCategory(id!);

  const ready = !isLoading && product_category;

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal>
      <RouteFocusModal.Title asChild>
        <span className="sr-only">{t('products.media.label')}</span>
      </RouteFocusModal.Title>
      <RouteFocusModal.Description asChild>
        <span className="sr-only">{t('products.media.editHint')}</span>
      </RouteFocusModal.Description>
      {ready && <CategoryMediaView category={product_category} />}
    </RouteFocusModal>
  );
};
