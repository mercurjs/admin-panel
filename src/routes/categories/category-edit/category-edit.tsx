import { RouteDrawer } from '@components/modals';
import { useProductCategory } from '@hooks/api';
import { Heading } from '@medusajs/ui';
import { EditCategoryForm } from '@routes/categories/category-edit/components/edit-category-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const CategoryEdit = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { product_category, isPending, isError, error } = useProductCategory(id!);

  const ready = !isPending && !!product_category;

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t('categories.edit.header')}</Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t('categories.edit.description')}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      {ready && <EditCategoryForm category={product_category} />}
    </RouteDrawer>
  );
};
