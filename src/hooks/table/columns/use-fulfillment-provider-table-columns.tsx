import { useMemo } from 'react';

import { TextCell, TextHeader } from '@components/table/table-cells/common/text-cell';
import { formatProvider } from '@lib/format-provider';
import type { HttpTypes } from '@medusajs/types';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<HttpTypes.AdminFulfillmentProvider>();

export const useFulfillmentProviderTableColumns = () => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => <TextHeader text="Provider" />,
        cell: ({ getValue }) => <TextCell text={formatProvider(getValue())} />
      })
    ],
    [t]
  );
};
