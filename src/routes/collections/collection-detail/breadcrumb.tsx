import { useCollection } from '@hooks/api';
import type { HttpTypes } from '@medusajs/types';
import type { UIMatch } from 'react-router-dom';

type CollectionDetailBreadcrumbProps = UIMatch<HttpTypes.AdminCollectionResponse>;

export const CollectionDetailBreadcrumb = (props: CollectionDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { collection } = useCollection(id!, {
    initialData: props.data,
    enabled: Boolean(id)
  });

  if (!collection) {
    return null;
  }

  return <span>{collection.title}</span>;
};
