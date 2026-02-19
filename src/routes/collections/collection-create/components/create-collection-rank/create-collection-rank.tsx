import { UseFormReturn, useWatch } from 'react-hook-form';
import {
  collectionMediaType,
  CreateCollectionSchema
} from '../create-collelction-modal/create-collection-modal';
import * as zod from 'zod';
import { useMemo, useState } from 'react';
import { useCollections } from '@hooks/api';
import { insertCollectionTreeItem } from '@routes/collections/common/utils';
import { Badge } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { CollectionTree } from '@routes/collections/common/components/collection-tree/collection-tree';

type CollectionTreeItem = {
  id: string;
  title: string;
  rank: number | null;
};

export const CreateCollectionRank = ({
  form,
  shouldFreeze
}: {
  form: UseFormReturn<zod.infer<typeof CreateCollectionSchema> & collectionMediaType>;
  shouldFreeze: boolean;
}) => {
  const { t } = useTranslation();
  const [snapshot, setSnapshot] = useState<CollectionTreeItem[]>([]);

  const ID = 'new-item';

  const { collections, isPending } = useCollections({
    limit: 9999
  });

  const watchedRank = useWatch({
    control: form.control,
    name: 'rank'
  });

  const watchedTitle = useWatch({
    control: form.control,
    name: 'title'
  });

  const value = useMemo(() => {
    const temp = {
      id: ID,
      title: watchedTitle,
      rank: watchedRank
    };

    return insertCollectionTreeItem((collections as unknown as CollectionTreeItem[]) ?? [], temp);
  }, [collections, watchedTitle, watchedRank]);

  const ready = !isPending && !!collections?.length;

  const normalizeRanks = (list: CollectionTreeItem[]) => {
    return list.map((item, index) => ({ ...item, rank: index }));
  };

  const handleChange = (
    {
      index: _index
    }: {
      index: number;
    },
    list: CollectionTreeItem[]
  ) => {
    const nextIndex = list.findIndex((i) => i.id === ID);

    form.setValue('rank', Math.max(0, nextIndex), {
      shouldDirty: true,
      shouldTouch: true
    });

    setSnapshot(normalizeRanks(list));
  };

  return (
    <div>
      <CollectionTree
        value={shouldFreeze ? snapshot : value}
        isLoading={!ready}
        enableDrag={item => item.id === ID}
        onChange={handleChange}
        renderValue={item => {
          if (item.id === ID) {
            return (
              <div
                className="flex items-center gap-x-3"
                data-testid="category-create-form-nesting-new-item"
              >
                <span>{item.title}</span>
                <Badge
                  size="2xsmall"
                  color="blue"
                  data-testid="category-create-form-nesting-new-badge"
                >
                  {t('categories.fields.new.label')}
                </Badge>
              </div>
            );
          }

          return item.title;
        }}
      />
    </div>
  );
};
