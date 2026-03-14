import { HttpTypes } from "@medusajs/types"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { TextCell } from "../../../components/table/table-cells/common/text-cell"
import { Thumbnail } from "@components/common/thumbnail"

const columnHelper = createColumnHelper<HttpTypes.AdminCollection>()

export const useCollectionTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.accessor("title", {
        header: t("fields.title"),
        cell: ({ getValue, row }) => { 
          const thumbnailId = (row.original as HttpTypes.AdminCollection & { collection_detail?: { thumbnail_id: string } }).collection_detail?.thumbnail_id

          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6">
                <Thumbnail src={thumbnailId} />
              </div>
              <TextCell text={getValue()} />
            </div>
          )},
      }),
      columnHelper.accessor("handle", {
        header: t("fields.handle"),
        cell: ({ getValue }) => <TextCell text={`/${getValue()}`} />,
      }),
      columnHelper.accessor("products", {
        header: t("fields.products"),
        cell: ({ getValue }) => {
          const count = getValue()?.length || undefined

          return <TextCell text={count} />
        },
      }),
    ],
    [t]
  )
}
