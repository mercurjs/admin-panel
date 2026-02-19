import { UniqueIdentifier } from '@dnd-kit/core';
import { ReactNode } from 'react';
import { SortableTree } from '@components/common/sortable-tree';
import { CollectionTreeItem } from '../../types';

export const CollectionTree = ({
  value,
  isLoading = false,
  onChange,
  enableDrag = true,
  renderValue
}: {
  value: CollectionTreeItem[];
  isLoading: boolean;
  onChange: (
    value: {
      id: UniqueIdentifier;
      parentId: UniqueIdentifier | null;
      index: number;
    },
    items: CollectionTreeItem[]
  ) => void;
  enableDrag?: boolean | ((item: CollectionTreeItem) => boolean);
  renderValue: (item: CollectionTreeItem) => ReactNode;
}) => {
  if (isLoading) {
    return (
      <div className="txt-compact-small relative flex-1 overflow-y-auto">
        {Array.from({ length: 10 }).map((_, i) => (
          <CollectionLeafPlaceholder key={i} />
        ))}
      </div>
    );
  }

  return (
    <SortableTree
      items={value}
      childrenProp="category_children"
      collapsible
      indentationWidth={9999}
      enableDrag={enableDrag}
      onChange={onChange}
      renderValue={renderValue}
    />
  );
};

const CollectionLeafPlaceholder = () => {
  return (
    <div className="bg-ui-bg-base -mb-px flex h-12 animate-pulse items-center border-y px-6 py-2.5" />
  );
};
