import type { PropsWithChildren } from 'react';

import { useDataGridCellError } from '@components/data-grid/hooks';
import type { DataGridCellProps } from '@components/data-grid/types';
import { clx } from '@medusajs/ui';

import { DataGridRowErrorIndicator } from './data-grid-row-error-indicator';

//@todo fix type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataGridReadonlyCellProps<TData, TValue = any> = PropsWithChildren<
  DataGridCellProps<TData, TValue>
> & {
  color?: 'muted' | 'normal';
};

//@todo fix type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DataGridReadonlyCell = <TData, TValue = any>({
  context,
  color = 'muted',
  children
}: DataGridReadonlyCellProps<TData, TValue>) => {
  const { rowErrors } = useDataGridCellError({ context });

  return (
    <div
      className={clx(
        'txt-compact-small flex size-full cursor-not-allowed items-center justify-between overflow-hidden px-4 py-2.5 text-ui-fg-subtle outline-none',
        color === 'muted' && 'bg-ui-bg-subtle',
        color === 'normal' && 'bg-ui-bg-base'
      )}
    >
      <div className="flex-1 truncate">{children}</div>
      <DataGridRowErrorIndicator rowErrors={rowErrors} />
    </div>
  );
};
