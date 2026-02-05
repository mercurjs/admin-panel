import { useCallback, useEffect, useState } from 'react';

import { useDataGridCell, useDataGridCellError } from '@components/data-grid/hooks';
import type { DataGridCellProps, InputProps } from '@components/data-grid/types';
import { useCombinedRefs } from '@hooks/use-combined-refs.tsx';
import { currencies, type CurrencyInfo } from '@lib/data/currencies.ts';
import CurrencyInput, { formatValue, type CurrencyInputProps } from 'react-currency-input-field';
import { Controller, type ControllerRenderProps } from 'react-hook-form';

import { DataGridCellContainer } from './data-grid-cell-container';

//@todo fix type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataGridCurrencyCellProps<TData, TValue = any> extends DataGridCellProps<TData, TValue> {
  code: string;
}

//@todo fix type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DataGridCurrencyCell = <TData, TValue = any>({
  context,
  code
}: DataGridCurrencyCellProps<TData, TValue>) => {
  const { field, control, renderProps } = useDataGridCell({
    context
  });
  const errorProps = useDataGridCellError({ context });

  const { container, input } = renderProps;

  const currency = currencies[code.toUpperCase()];

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
            currencyInfo={currency}
          />
        </DataGridCellContainer>
      )}
    />
  );
};

const Inner = ({
  field,
  inputProps,
  currencyInfo
}: {
  //@todo fix type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, string>;
  inputProps: InputProps;
  currencyInfo: CurrencyInfo;
}) => {
  const { value, onBlur, ref, ...rest } = field;
  const { ref: inputRef, onBlur: onInputBlur, onFocus, onChange, ...attributes } = inputProps;

  const formatter = useCallback(
    (value?: string | number) => {
      const ensuredValue = typeof value === 'number' ? value.toString() : value || '';

      return formatValue({
        value: ensuredValue,
        decimalScale: currencyInfo.decimal_digits,
        disableGroupSeparators: true,
        decimalSeparator: '.'
      });
    },
    [currencyInfo]
  );

  const [localValue, setLocalValue] = useState<string | number>(value || '');

  const handleValueChange: CurrencyInputProps['onValueChange'] = value => {
    if (!value) {
      setLocalValue('');

      return;
    }

    setLocalValue(value);
  };

  useEffect(() => {
    let update = value;

    // The component we use is a bit fidly when the value is updated externally
    // so we need to ensure a format that will result in the cell being formatted correctly
    // according to the users locale on the next render.
    if (!isNaN(Number(value))) {
      update = formatter(update);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalValue(update);
  }, [value, formatter]);

  const combinedRed = useCombinedRefs(inputRef, ref);

  return (
    <div className="relative flex size-full items-center">
      <span
        className="txt-compact-small pointer-events-none absolute left-0 w-fit min-w-4 text-ui-fg-muted"
        aria-hidden
      >
        {currencyInfo.symbol_native}
      </span>
      <CurrencyInput
        {...rest}
        {...attributes}
        ref={combinedRed}
        className="txt-compact-small w-full flex-1 cursor-default appearance-none bg-transparent pl-8 text-right outline-none"
        value={localValue || undefined}
        onValueChange={handleValueChange}
        formatValueOnBlur
        onBlur={() => {
          onBlur();
          onInputBlur();

          onChange(localValue, value);
        }}
        onFocus={onFocus}
        decimalScale={currencyInfo.decimal_digits}
        decimalsLimit={currencyInfo.decimal_digits}
        autoComplete="off"
        tabIndex={-1}
      />
    </div>
  );
};
