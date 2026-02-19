import { CollectionTreeItem } from './types';

export const insertCollectionTreeItem = (
  collections: CollectionTreeItem[],
  newItem: CollectionTreeItem
): CollectionTreeItem[] => {
  const withoutNewItem = collections.filter((c) => c.id !== newItem.id);

  const targetIndexRaw = newItem.rank ?? 0;
  const targetIndex = Math.max(0, Math.min(targetIndexRaw, withoutNewItem.length));

  const next = [...withoutNewItem];
  next.splice(targetIndex, 0, newItem);

  next.forEach((item, index) => {
    item.rank = index;
  });

  return next;
};
