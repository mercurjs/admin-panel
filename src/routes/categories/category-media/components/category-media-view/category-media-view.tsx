import { HttpTypes } from '@medusajs/types';
import { useSearchParams } from 'react-router-dom';
import { CategoryMediaViewContext } from './category-media-view-context';
import { CategoryMediaGallery } from '../category-media-gallery/category-media-gallery';
import { EditCategoryMediaForm } from '../edit-category-media-form/edit-category-media-form';

enum View {
  GALLERY = 'gallery',
  EDIT = 'edit'
}

const getView = (searchParams: URLSearchParams) => {
  const view = searchParams.get('view');

  if (view === View.EDIT) {
    return View.EDIT;
  }

  return View.GALLERY;
};

export const CategoryMediaView = ({ category }: { category: HttpTypes.AdminProductCategory }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = getView(searchParams);
  const type = searchParams.get('type');

  const handleGoToView = (view: View) => {
    return () => {
      setSearchParams({ view });
    };
  };

  return (
    <CategoryMediaViewContext.Provider
      value={{
        goToGallery: handleGoToView(View.GALLERY),
        goToEdit: handleGoToView(View.EDIT)
      }}
    >
      {renderView(view, category, type)}
    </CategoryMediaViewContext.Provider>
  );
};

const renderView = (view: View, category: HttpTypes.AdminProductCategory, type: string | null) => {
  switch (view) {
    case View.GALLERY:
      return <CategoryMediaGallery category={category} />;
    case View.EDIT:
      return (
        <EditCategoryMediaForm
          category={category}
          type={type}
        />
      );
  }
};
