import { useMemo } from "react"
import { Checkbox } from "@medusajs/ui"
import { createColumnHelper } from "@tanstack/react-table"
import { useTranslation } from "react-i18next"

import {
  ProductCell,
  ProductHeader,
} from "../../../../../components/table/table-cells/product/product-cell"
import { getStylizedAmount } from "../../../../../lib/money-amount-helpers"

const columnHelper = createColumnHelper<any>()

export const useClaimItemTableColumns = (currencyCode: string) => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : table.getIsAllPageRowsSelected()
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          )
        },
        cell: ({ row }) => {
          const isSelectable = row.getCanSelect()

          return (
            <Checkbox
              disabled={!isSelectable}
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          )
        },
      }),
      columnHelper.display({
        id: "product",
        header: () => <ProductHeader />,
        cell: ({ row }) => (
          <ProductCell
            product={{
              thumbnail: row.original.thumbnail,
              title: row.original.product_title,
            }}
          />
        ),
      }),
      columnHelper.accessor("variant_title", {
        header: t("fields.variant"),
      }),
      columnHelper.accessor("variant_sku", {
        header: t("fields.sku"),
        cell: ({ getValue }) => {
          return getValue() || "-"
        },
      }),
      columnHelper.display({
        id: "category",
        header: t("fields.category"),
        cell: ({ row }) => {
          const categoryName =
            row.original.variant?.product?.categories?.[0]?.name || "-"
          return categoryName
        },
      }),
      columnHelper.display({
        id: "collection",
        header: t("fields.collection"),
        cell: ({ row }) => {
          const collectionTitle =
            row.original.variant?.product?.collection?.title || "-"
          return collectionTitle
        },
      }),
      columnHelper.accessor("unit_price", {
        header: () => (
          <div className="flex size-full items-center justify-end overflow-hidden text-right">
            <span className="truncate">{t("fields.price")}</span>
          </div>
        ),
        cell: ({ getValue }) => {
          const amount = getValue() || 0

          const stylized = getStylizedAmount(amount, currencyCode)

          return (
            <div className="flex size-full items-center justify-end overflow-hidden text-right">
              <span className="truncate">{stylized}</span>
            </div>
          )
        },
      }),
    ],
    [t, currencyCode]
  )
}
