import { SingleColumnPageSkeleton } from '@components/common/skeleton';
import { SingleColumnPage } from '@components/layout/pages';
import { useStore } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { StoreCurrencySection } from '@routes/store/store-detail/components/store-currency-section';
import { StoreGeneralSection } from '@routes/store/store-detail/components/store-general-section';
import type { storeLoader } from '@routes/store/store-detail/loader';
import { useLoaderData } from 'react-router-dom';

export const StoreDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof storeLoader>>;

  const { store, isPending, isError, error } = useStore(undefined, {
    initialData
  });

  const { getWidgets } = useExtension();

  if (isPending || !store) {
    return (
      <SingleColumnPageSkeleton
        sections={2}
        showJSON
        showMetadata
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets('store.details.before'),
        after: getWidgets('store.details.after')
      }}
      data={store}
      hasOutlet
      showMetadata
      showJSON
    >
      <StoreGeneralSection store={store} />
      <StoreCurrencySection store={store} />
    </SingleColumnPage>
  );
};
