import { SingleColumnPageSkeleton } from '@components/common/skeleton';
import { SingleColumnPage } from '@components/layout/pages';
import { useProductTag } from '@hooks/api';
import { useExtension } from '@providers/extension-provider';
import { ProductTagGeneralSection } from '@routes/product-tags/product-tag-detail/components/product-tag-general-section';
import { ProductTagProductSection } from '@routes/product-tags/product-tag-detail/components/product-tag-product-section';
import { useLoaderData, useParams } from 'react-router-dom';

import type { productTagLoader } from './loader';

export const ProductTagDetail = () => {
  const { id } = useParams();

  const initialData = useLoaderData() as Awaited<ReturnType<typeof productTagLoader>>;

  const { getWidgets } = useExtension();

  const { product_tag, isPending, isError, error } = useProductTag(id!, undefined, {
    initialData
  });

  if (isPending || !product_tag) {
    return (
      <SingleColumnPageSkeleton
        showJSON
        sections={2}
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets('product_tag.details.after'),
        before: getWidgets('product_tag.details.before')
      }}
      showJSON
      showMetadata
      data={product_tag}
    >
      <ProductTagGeneralSection productTag={product_tag} />
      <ProductTagProductSection productTag={product_tag} />
    </SingleColumnPage>
  );
};
