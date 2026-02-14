import { useState } from 'react';

import { _DataTable } from '@components/table/data-table';
import { useVendorRequests } from '@hooks/api/requests';
import { RequestProductData, useRequestProductTableColumns } from '@hooks/table/columns';
import { useRequestProductTableFilters } from '@hooks/table/filters';
import { useRequestProductTableQuery } from '@hooks/table/query';
import { useDataTable } from '@hooks/use-data-table';
import { ResolveRequestPrompt } from '@routes/requests/common/components/resolve-request';
import { keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 20;

const DEFAULT_FIELDS =
  'id,type,data,submitter_id,reviewer_id,reviewer_note,status,created_at,updated_at,product,seller.*';

export const RequestProductListTable = () => {
  const { t } = useTranslation();

  const [promptOpen, setPromptOpen] = useState(false);
  const [requestAccept, setRequestAccept] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const { searchParams, raw } = useRequestProductTableQuery({
    pageSize: PAGE_SIZE
  });

  const { requests, isLoading, isError, error, count, refetch } = useVendorRequests(
    {
      ...searchParams,
      fields: DEFAULT_FIELDS,
      type: 'product'
    },
    {
      placeholderData: keepPreviousData
    }
  );

  const handlePrompt = (id: string, accept: boolean) => {
    setSelectedRequestId(id);
    setRequestAccept(accept);
    setPromptOpen(true);
  };

  const columns = useRequestProductTableColumns({
    handlePrompt
  });
  const filters = useRequestProductTableFilters();

  const { table } = useDataTable<RequestProductData>({
    data: (requests ?? []) as RequestProductData[],
    columns,
    enablePagination: true,
    count,
    pageSize: PAGE_SIZE
  });

  if (isError) {
    throw error;
  }

  return (
    <>
      <ResolveRequestPrompt
        close={() => {
          setPromptOpen(false);
          setSelectedRequestId(null);
        }}
        open={promptOpen}
        id={selectedRequestId || ''}
        accept={requestAccept}
        onSuccess={() => {
          refetch();
        }}
        toastMessage={
          requestAccept
            ? t('requests.resolve.accept.product.successMessage')
            : t('requests.resolve.reject.product.successMessage')
        }
        description={
          requestAccept
            ? t('requests.resolve.accept.product.description')
            : t('requests.resolve.reject.product.description')
        }
      />
      <_DataTable
        columns={columns}
        table={table}
        pagination
        filters={filters}
        count={count}
        search
        isLoading={isLoading}
        pageSize={PAGE_SIZE}
        queryObject={raw}
        noRecords={{
          title: t('requests.products.noRecordsTitle'),
          message: t('requests.products.noRecordsMessage')
        }}
        navigateTo={({ original }) => {
          if (original.data?.deleted_at) {
            return '';
          }
          return `/products/${original.data?.product_id}`;
        }}
        orderBy={[
          { key: 'title', label: t('fields.title') },
          { key: 'created_at', label: t('fields.createdAt') },
          { key: 'updated_at', label: t('fields.updatedAt') }
        ]}
      />
    </>
  );
};
