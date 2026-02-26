import { LoaderFunctionArgs } from "react-router-dom"

import { collectionsQueryKeys } from "../../../hooks/api/collections"
import { FetchError } from "@medusajs/js-sdk"
import { sdk } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"

type AdminCollectionDetailMedia = {
  id: string
  url: string
  alt_text: string | null
}

type AdminCollectionDetail = {
  id: string
  media: AdminCollectionDetailMedia[]
  thumbnail_id: string | null
  icon_id: string | null
  banner_id: string | null
  rank: number
}

const collectionDetailQuery = (id: string) => ({
  queryKey: collectionsQueryKeys.detail(id),
  queryFn: async () => {
    const { collection } = await sdk.admin.productCollection.retrieve(id)

    try {
      const { collection_detail } = await sdk.client.fetch<{
        collection_detail: AdminCollectionDetail
      }>(`/admin/collections/${id}/details`, {
        method: "GET",
      })

      return {
        collection: {
          ...collection,
          collection_detail,
        },
      }
    } catch (error) {
      if (error instanceof FetchError && error.status === 404) {
        return { collection }
      }

      throw error
    }
  },
})

export const collectionLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id
  const query = collectionDetailQuery(id!)

  return queryClient.ensureQueryData(query)
}
