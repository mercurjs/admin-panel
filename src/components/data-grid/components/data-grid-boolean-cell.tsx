import { useDataGridCell, useDataGridCellError } from '@components/data-grid/hooks';
import type { DataGridCellProps, InputProps } from '@components/data-grid/types';
import { useCombinedRefs } from '@hooks/use-combined-refs.tsx';
import { Checkbox } from '@medusajs/ui';
import { Controller, type ControllerRenderProps } from 'react-hook-form';

import { DataGridCellContainer } from './data-grid-cell-container';

export const DataGridBooleanCell = <TData, TValue = unknown>({
  context,
  disabled
}: DataGridCellProps<TData, TValue> & { disabled?: boolean }) => {
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
            disabled={disabled}
          />
        </DataGridCellContainer>
      )}
    />
  );
};

const Inner = ({
  field,
  inputProps,
  disabled
}: {
  //@todo fix type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, string>;
  inputProps: InputProps;
  disabled?: boolean;
}) => {
  const { ref, value, onBlur, name, disabled: fieldDisabled } = field;
  const { ref: inputRef, onBlur: onInputBlur, onChange, onFocus, ...attributes } = inputProps;

  const combinedRefs = useCombinedRefs(ref, inputRef);

  return (
    <Checkbox
      disabled={disabled || fieldDisabled}
      name={name}
      checked={value}
      onCheckedChange={newValue => onChange(newValue === true, value)}
      onFocus={onFocus}
      onBlur={() => {
        onBlur();
        onInputBlur();
      }}
      ref={combinedRefs}
      tabIndex={-1}
      {...attributes}
    />
  );
};
