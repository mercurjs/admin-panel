import { useCallback, useEffect, type ChangeEvent } from 'react';

import { useSelectedParams } from '@components/table/data-table/hooks';
import { Input } from '@medusajs/ui';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (!value) {
        selectedParams.delete();
      } else {
        selectedParams.add(value);
      }
    }, 500),
    [prefix]
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
