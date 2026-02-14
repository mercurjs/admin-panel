import { useMemo } from 'react';

import { Thumbnail } from '@components/common/thumbnail';
import { DateCell } from '@components/table/table-cells/common/date-cell';
import { TextCell, TextHeader } from '@components/table/table-cells/common/text-cell';
import { AdminRequest, AdminRequestType } from '@custom-types/requests';
import { Check, XMark } from '@medusajs/icons';
import type { ProductDTO } from '@medusajs/types';
import { IconButton } from '@medusajs/ui';
import { getRequestStatus } from '@routes/requests/common/utils/get-status';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

const getOperationText = (t: TFunction<'translation'>, type?: AdminRequestType): string => {
  if (!type) {
    return t('general.unknown');
  }

  switch (type) {
    case 'product':
      return t('requests.product_operation.creation');
    case 'product_update':
      return t('requests.product_operation.update');
    default:
      return t('general.unknown');
  }
};

export interface RequestProductData extends AdminRequest {
  data?: ProductDTO & { product_id: string };
  title?: string;
}

const columnHelper = createColumnHelper<RequestProductData>();

type UseRequestProductTableColumnsProps = {
  handlePrompt?: (id: string, accept: boolean) => void;
};

export const useRequestProductTableColumns = ({
  handlePrompt
}: UseRequestProductTableColumnsProps = {}): ColumnDef<RequestProductData, unknown>[] => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      columnHelper.display({
        id: 'title',
        header: () => <TextHeader text={t('fields.name')} />,
        cell: ({ row }) => {
          const product = row.original.data as ProductDTO;
          return (
            <div className="flex h-full w-full max-w-[250px] items-center gap-x-3 overflow-hidden">
              <div className="w-fit flex-shrink-0">
                <Thumbnail src={product.thumbnail} />
              </div>
              <span
                data-testid={`products-table-cell-${row.id}-title-value`}
                title={product.title}
                className="truncate"
              >
                {product.title}
              </span>
            </div>
          );
        }
      }),
      columnHelper.display({
        id: 'type',
        header: () => <TextHeader text={t('fields.operation')} />,
        cell: ({ row }) => {
          return <TextCell text={getOperationText(t, row.original.type)} />;
        }
      }),
      columnHelper.display({
        id: 'vendor',
        header: () => <TextHeader text={t('fields.vendor')} />,
        cell: ({ row }) => {
          return <TextCell text={row.original.seller?.name ?? t('general.unknown')} />;
        }
      }),
      columnHelper.display({
        id: 'created_at',
        header: () => <TextHeader text={t('fields.created')} />,
        cell: ({ row }) => {
          return <DateCell date={row.original.created_at} />;
        }
      }),
      columnHelper.display({
        id: 'status',
        header: () => <TextHeader text={t('fields.status')} />,
        cell: ({ row }) => {
          return getRequestStatus(t, row.original.status ?? 'draft');
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: () => (
          <div
            className="flex h-full w-full items-center"
            data-testid="products-table-header-actions"
          >
            <span data-testid="products-table-header-actions-text"></span>
          </div>
        ),
        cell: ({ row }) => {
          const request = row.original;

          if (request.status !== 'pending') {
            return null;
          }

          return (
            <div className="flex items-center gap-x-2">
              <IconButton
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePrompt?.(request.id!, true);
                }}
                data-testid={`request-product-accept-${request.id}`}
              >
                <Check className="text-ui-tag-green-icon" />
              </IconButton>
              <IconButton
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  handlePrompt?.(request.id!, false);
                }}
                data-testid={`request-product-reject-${request.id}`}
              >
                <XMark className="text-ui-tag-red-icon" />
              </IconButton>
            </div>
          );
        }
      })
    ],
    [t, handlePrompt]
  );
};
