import { SingleColumnPageSkeleton } from '@components/common/skeleton';
import { SingleColumnPage } from '@components/layout/pages';
import { useCollection } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { CollectionGeneralSection } from '@routes/collections/collection-detail/components/collection-general-section';
import { CollectionProductSection } from '@routes/collections/collection-detail/components/collection-product-section';
import type { collectionLoader } from '@routes/collections/collection-detail/loader.ts';
import { useLoaderData, useParams } from 'react-router-dom';

export const CollectionDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof collectionLoader>>;

  const { id } = useParams();
  const { collection, isLoading, isError, error } = useCollection(id!, {
    initialData
  });

  const { getWidgets } = useExtension();

  if (isLoading || !collection) {
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
        after: getWidgets('product_collection.details.after'),
        before: getWidgets('product_collection.details.before')
      }}
      showJSON
      showMetadata
      data={collection}
    >
      <CollectionGeneralSection collection={collection} />
      <CollectionProductSection collection={collection} />
    </SingleColumnPage>
  );
};
