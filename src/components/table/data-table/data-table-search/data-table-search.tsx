import { useCallback, useEffect, useRef, type ChangeEvent } from 'react';

import { Input } from '@medusajs/ui';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useSelectedParams } from '../hooks';

type DataTableSearchProps = {
  placeholder?: string;
  prefix?: string;
  autofocus?: boolean;
};

export const DataTableSearch = ({ placeholder, prefix, autofocus }: DataTableSearchProps) => {
  const { t } = useTranslation();
  const placeholderText = placeholder || t('general.search');
  const selectedParams = useSelectedParams({
    param: 'q',
    prefix,
    multiple: false
  });

  const query = selectedParams.get();

  const selectedParamsRef = useRef(selectedParams);
  selectedParamsRef.current = selectedParams;

  const debouncedOnChange = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (!value) {
        selectedParamsRef.current.delete();
      } else {
        selectedParamsRef.current.add(value);
      }
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  return (
    <Input
      autoComplete="off"
      name="q"
      type="search"
      size="small"
      autoFocus={autofocus}
      defaultValue={query?.[0] || undefined}
      onChange={debouncedOnChange}
      placeholder={placeholderText}
      data-testid="data-table-search-input"
    />
  );
};
