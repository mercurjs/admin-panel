import { useEffect, useState } from 'react';

import type { AdminOrderLineItem } from '@medusajs/types';
import type { RowSelectionState } from '@tanstack/react-table';

import { getReturnableQuantity } from '@/lib/rma';

export function useSelectableRowSelection(
  selectedItems: string[],
  items: AdminOrderLineItem[],
  isRowSelectable: (item: AdminOrderLineItem) => boolean,
  canAdminActOnItem: (item: unknown) => boolean
) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(() => {
    const initial: RowSelectionState = {};
    selectedItems.forEach(id => {
      const item = items.find(i => i.id === id);
      if (!item || !isRowSelectable(item)) return;
      initial[id] = true;
    });

    return initial;
  });

  useEffect(() => {
    const next: RowSelectionState = {};
    selectedItems.forEach(id => {
      const item = items.find(i => i.id === id);
      if (!item || getReturnableQuantity(item) <= 0) return;
      if (!canAdminActOnItem(item)) return;
      next[id] = true;
    });
    setRowSelection(next);
  }, [selectedItems, items, canAdminActOnItem]);

  return [rowSelection, setRowSelection] as const;
}
