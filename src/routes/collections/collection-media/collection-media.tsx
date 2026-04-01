import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"

import { RouteFocusModal } from "../../../components/modals"
import { useCollection } from "../../../hooks/api/collections"
import { CollectionMediaView } from "./components/collection-media-view"

export const CollectionMedia = () => {
  const { t } = useTranslation()
  const { id } = useParams()

  const { collection, isLoading, isError, error } = useCollection(id!)

  const ready = !isLoading && collection

  if (isError) {
    throw error
  }

  return (
    <RouteFocusModal>
      <RouteFocusModal.Title asChild>
        <span className="sr-only">{t("products.media.label")}</span>
      </RouteFocusModal.Title>
      <RouteFocusModal.Description asChild>
        <span className="sr-only">{t("products.media.editHint")}</span>
      </RouteFocusModal.Description>
      {ready && <CollectionMediaView collection={collection} />}
    </RouteFocusModal>
  )
}


