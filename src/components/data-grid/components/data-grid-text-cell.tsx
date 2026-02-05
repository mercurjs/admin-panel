import { useEffect, useState } from 'react';

import { useDataGridCell, useDataGridCellError } from '@components/data-grid/hooks';
import type { DataGridCellProps, InputProps } from '@components/data-grid/types';
import { useCombinedRefs } from '@hooks/use-combined-refs.tsx';
import { clx } from '@medusajs/ui';
import { Controller, type ControllerRenderProps } from 'react-hook-form';

import { DataGridCellContainer } from './data-grid-cell-container';

export const DataGridTextCell = <TData, TValue = unknown>({
  context
}: DataGridCellProps<TData, TValue>) => {
  const { field, control, renderProps } = useDataGridCell({
    context
  });
  const errorProps = useDataGridCellError({ context });

  const { container, input } = renderProps;

  return (
    <Controller
      control={control}
      name={field}
      render={({ field }) => (
        <DataGridCellContainer
          {...container}
          {...errorProps}
        >
          <Inner
            field={field}
            inputProps={input}
          />
        </DataGridCellContainer>
      )}
    />
  );
};

const Inner = ({
  field,
  inputProps
}: {
  //@todo fix type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, string>;
  inputProps: InputProps;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onChange: _, onBlur, ref, value, ...rest } = field;
  const { ref: inputRef, onBlur: onInputBlur, onChange, ...input } = inputProps;

  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const combinedRefs = useCombinedRefs(inputRef, ref);

  return (
    <input
      className={clx(
        'txt-compact-small flex size-full cursor-pointer items-center justify-center bg-transparent text-ui-fg-subtle outline-none',
        'focus:cursor-text'
      )}
      autoComplete="off"
      tabIndex={-1}
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      ref={combinedRefs}
      onBlur={() => {
        onBlur();
        onInputBlur();

        // We propagate the change to the field only when the input is blurred
        onChange(localValue, value);
      }}
      {...input}
      {...rest}
    />
  );
};
