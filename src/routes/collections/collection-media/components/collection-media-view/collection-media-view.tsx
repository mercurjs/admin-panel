import type { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "react-router-dom"

import { CollectionMediaGallery } from "../collection-media-gallery"
import { EditCollectionMediaForm } from "../edit-collection-media-form"
import { CollectionMediaViewContext } from "./collection-media-view-context"

type CollectionMediaViewProps = {
  collection: HttpTypes.AdminCollection
}

enum View {
  GALLERY = "gallery",
  EDIT = "edit",
}

const getView = (searchParams: URLSearchParams) => {
  const view = searchParams.get("view")
  

  if (view === View.EDIT) {
    return View.EDIT
  }

  return View.GALLERY
}

export const CollectionMediaView = ({ collection }: CollectionMediaViewProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = getView(searchParams)
  const type = searchParams.get("type")

  const handleGoToView = (view: View) => {
    return () => {
      setSearchParams({ view })
    }
  }

  return (
    <CollectionMediaViewContext.Provider
      value={{
        goToGallery: handleGoToView(View.GALLERY),
        goToEdit: handleGoToView(View.EDIT),
      }}
    >
      {renderView(view, collection, type)}
    </CollectionMediaViewContext.Provider>
  )
}

const renderView = (view: View, collection: HttpTypes.AdminCollection, type: string | null) => {
  switch (view) {
    case View.GALLERY:
      return <CollectionMediaGallery collection={collection} />
    case View.EDIT:
      return <EditCollectionMediaForm collection={collection} type={type} />
  }
}
