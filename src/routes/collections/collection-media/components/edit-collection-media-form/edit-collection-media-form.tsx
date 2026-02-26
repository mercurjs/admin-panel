import type { HttpTypes } from "@medusajs/types"
import {
  Button,
  Checkbox,
  clx,
  CommandBar,
  Tooltip,
  toast,
} from "@medusajs/ui"
import { Fragment, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"

import { ThumbnailBadge } from "@medusajs/icons"

import { BannerIcon } from "@assets/icons/BannerIcon"
import { RouteFocusModal, useRouteModal } from "@components/modals"
import { KeyboundForm } from "@components/utilities/keybound-form"
import { usePostCollectionDetails } from "@hooks/api"
import { sdk } from "@lib/client"
import { CollectionDetail } from "@routes/collections/collection-detail/types"
import { UploadMediaFormItem } from "@routes/products/common/components/upload-media-form-item"
import { EditCollectionMediaSchema } from "../../constants"
import { EditCollectionMediaSchemaType } from "../../types"

type EditCollectionMediaFormProps = {
  collection: HttpTypes.AdminCollection & {
    collection_detail?: CollectionDetail
  }
  type: string | null
}

type MediaField = EditCollectionMediaSchemaType["media"][number] & {
  field_id: string
  isBanner?: boolean
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
}

export const EditCollectionMediaForm = ({
  collection,
  type,
}: EditCollectionMediaFormProps) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [selection, setSelection] = useState<Record<string, true>>({})
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([])

  const isIconType = type === "icon"

  const { mutateAsync: postCollectionDetailsMutation, isPending } =
    usePostCollectionDetails()

  const thumbnailId = collection.collection_detail?.thumbnail_id ?? null
  const bannerId = collection.collection_detail?.banner_id ?? null
  const iconId = collection.collection_detail?.icon_id ?? null

  const iconMedia = useMemo(() => {
    if (!iconId) {
      return undefined
    }

    return collection.collection_detail?.media?.find((m) => m.id === iconId)
  }, [collection.collection_detail?.media, iconId])

  const defaultMedia: EditCollectionMediaSchemaType["media"] = useMemo(() => {
    if (isIconType) {
      return iconMedia
        ? [
            {
              id: iconMedia.id,
              url: iconMedia.url,
              isThumbnail: false,
              file: null,
            },
          ]
        : []
    }

    return (collection.collection_detail?.media ?? [])
      .filter((m) => m.id !== iconId)
      .map((m) => ({
        id: m.id,
        url: m.url,
        isThumbnail: m.id === thumbnailId,
        file: null,
      }))
  }, [bannerId, collection.collection_detail?.media, iconId, iconMedia, isIconType, thumbnailId])

  const form = useForm<EditCollectionMediaSchemaType>({
    defaultValues: {
      media: defaultMedia,
    },
    resolver: zodResolver(EditCollectionMediaSchema),
  })

  const { fields, append, remove } = useFieldArray({
    name: "media",
    control: form.control,
    keyName: "field_id",
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((item) => item.field_id === active.id)
      const newIndex = fields.findIndex((item) => item.field_id === over?.id)

      form.setValue("media", arrayMove(fields, oldIndex, newIndex), {
        shouldDirty: true,
        shouldTouch: true,
      })
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const handleCheckedChange = useCallback(
    (id: string) => {
      return (val: boolean) => {
        if (!val) {
          const { [id]: _, ...rest } = selection
          setSelection(rest)
        } else {
          setSelection((prev) => ({ ...prev, [id]: true }))
        }
      }
    },
    [selection]
  )

  const handleDelete = () => {
    const ids = Object.keys(selection)
    const indices = ids.map((id) => fields.findIndex((m) => m.id === id))

    setMediaToDelete(ids)
    remove(indices)
    setSelection({})
  }

  const handlePromoteToThumbnail = () => {
    const id = Object.keys(selection)[0]

    postCollectionDetailsMutation({
      id: collection.id,
      payload: { media: { delete: [], create: [] }, thumbnail: id },
    })
    setSelection({})
  }

  const handlePromoteToBanner = () => {
    const id = Object.keys(selection)[0]

    postCollectionDetailsMutation({
      id: collection.id,
      payload: { media: { delete: [], create: [] }, banner: id },
    })
    setSelection({})
  }

  const selectionCount = Object.keys(selection).length

  const handleSubmit = form.handleSubmit(async ({ media }) => {
    const filesToUpload = !isIconType
      ? media
          .map((m, i) => ({ file: m.file, index: i }))
          .filter((m) => !!m.file)
      : [
          {
            file: [...media].reverse().find((m) => !!m.file)?.file,
            index: 0,
          },
        ].filter((m) => !!m.file)

    let uploaded: HttpTypes.AdminFile[] = []

    if (filesToUpload.length) {
      const { files: uploads } = await sdk.admin.upload
        .create({ files: filesToUpload.map((m) => m.file) })
        .catch(() => {
          form.setError("media", {
            type: "invalid_file",
            message: t("products.media.failedToUpload"),
          })
          return { files: [] }
        })

      uploaded = uploads
    }

    const mediaToCreate = uploaded.map((item) => ({ url: item.url, alt_text: "" }))

    if (isIconType) {
      const deleteIds = iconMedia?.id ? [iconMedia.id] : []
      let payload = {
        media: { delete: deleteIds, create: [] },
      } as {
        media: { delete: string[]; create: { url: string; alt_text?: string }[] };
        icon?: { url: string} | string |null;
      };
      
      if (mediaToCreate[0]?.url) {
        payload = { ...payload, icon: { url: mediaToCreate[0]?.url } }
      }
      
      await postCollectionDetailsMutation(
        {
          id: collection.id,
          payload,
        },
        {
          onSuccess: () => {
            toast.success(t("products.media.successToast"))
            handleSuccess(`/collections/${collection.id}`)
          },
          onError: (error: any) => {
            toast.error(error.message)
          },
        } as any
      )
      return
    }

    await postCollectionDetailsMutation(
      {
        id: collection.id,
        payload: {
          media: { delete: mediaToDelete, create: mediaToCreate },
        },
      },
      {
        onSuccess: () => {
          toast.success(t("products.media.successToast"))
          handleSuccess(`/collections/${collection.id}`)
        },
        onError: (error: any) => {
          toast.error(error.message)
        },
      } as any
    )
  })

  return (
    <RouteFocusModal.Form blockSearchParams form={form} data-testid="collection-edit-media-form">
      <KeyboundForm
        className="flex size-full flex-col overflow-hidden"
        onSubmit={handleSubmit}
        data-testid="collection-edit-media-keybound-form"
      >
        <RouteFocusModal.Header data-testid="collection-edit-media-form-header">
          <div className="flex items-center justify-end gap-x-2">
            <Button variant="secondary" size="small" asChild>
              <Link to={{ pathname: ".", search: undefined }}>
                {t("products.media.galleryLabel")}
              </Link>
            </Button>
          </div>
        </RouteFocusModal.Header>

        <RouteFocusModal.Body className="flex flex-col overflow-hidden" data-testid="collection-edit-media-form-body">
          <div className="flex size-full flex-col-reverse lg:grid lg:grid-cols-[1fr_560px]">
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
            >
              <div className="size-full overflow-auto bg-ui-bg-subtle">
                <div className="grid h-fit auto-rows-auto grid-cols-4 gap-6 p-6">
                  <SortableContext items={fields.map((m) => m.field_id)} strategy={rectSortingStrategy}>
                    {fields.map((m) => {
                      const isBanner = !!bannerId && m.id === bannerId

                      return (
                        <MediaGridItem
                          onCheckedChange={handleCheckedChange(m.id!)}
                          checked={!!selection[m.id!]}
                          key={m.field_id}
                          media={{ ...(m as any), isBanner }}
                        />
                      )
                    })}
                  </SortableContext>

                  <DragOverlay dropAnimation={dropAnimationConfig}>
                    {activeId ? (
                      <MediaGridItemOverlay
                        media={{
                          ...(fields.find((m) => m.field_id === activeId)! as any),
                          isBanner: !!bannerId && fields.find((m) => m.field_id === activeId)?.id === bannerId,
                        }}
                        checked={
                          !!selection[fields.find((m) => m.field_id === activeId)!.id!]
                        }
                      />
                    ) : null}
                  </DragOverlay>
                </div>
              </div>
            </DndContext>

            <div className="overflow-auto border-b bg-ui-bg-base px-6 py-4 lg:border-b-0 lg:border-l">
              <UploadMediaFormItem
                form={form as any}
                append={append as any}
                multiple={!isIconType}
              />
            </div>
          </div>
        </RouteFocusModal.Body>

        <CommandBar open={!!selectionCount}>
          <CommandBar.Bar>
            <CommandBar.Value>
              {t("general.countSelected", { count: selectionCount })}
            </CommandBar.Value>
            <CommandBar.Seperator />
            {!isIconType && selectionCount === 1 && (
              <>
                <Fragment>
                  <CommandBar.Command
                    action={handlePromoteToThumbnail}
                    label={t("products.media.makeThumbnail")}
                    shortcut="t"
                  />
                  <CommandBar.Seperator />
                </Fragment>
                <Fragment>
                  <CommandBar.Command
                    action={handlePromoteToBanner}
                    label="Make banner"
                    shortcut="b"
                  />
                  <CommandBar.Seperator />
                </Fragment>
              </>
            )}
            <CommandBar.Command action={handleDelete} label={t("actions.delete")} shortcut="d" />
          </CommandBar.Bar>
        </CommandBar>

        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button variant="secondary" size="small">
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            <Button size="small" type="submit" isLoading={isPending}>
              {t("actions.save")}
            </Button>
          </div>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}

const MediaGridItem = ({
  media,
  checked,
  onCheckedChange,
}: {
  media: MediaField
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) => {
  const { t } = useTranslation()

  const handleToggle = useCallback(
    (value: boolean) => {
      onCheckedChange(value)
    },
    [onCheckedChange]
  )

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: media.field_id })

  const style = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      className={clx(
        "group relative aspect-square h-auto max-w-full overflow-hidden rounded-lg bg-ui-bg-subtle-hover shadow-elevation-card-rest outline-none hover:shadow-elevation-card-hover focus-visible:shadow-borders-focus"
      )}
      style={style}
      ref={setNodeRef}
    >
      {(media.isThumbnail || media.isBanner) && (
        <div className="absolute left-2 top-2 flex items-center gap-x-1">
          {media.isThumbnail && (
            <Tooltip content={t("products.media.thumbnailTooltip")}>
              <ThumbnailBadge />
            </Tooltip>
          )}
          {media.isBanner && (
            <Tooltip content="Banner">
              <BannerIcon />
            </Tooltip>
          )}
        </div>
      )}

      <div
        className={clx("absolute inset-0 cursor-grab touch-none outline-none", {
          "cursor-grabbing": isDragging,
        })}
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
      />

      <div
        className={clx("absolute right-2 top-2 opacity-0 transition-fg", {
          "group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100":
            !isDragging && !checked,
          "opacity-100": checked,
        })}
      >
        <Checkbox
          onClick={(e) => {
            e.stopPropagation()
          }}
          checked={checked}
          onCheckedChange={handleToggle}
        />
      </div>

      <img src={media.url} alt="" className="size-full object-cover object-center" />
    </div>
  )
}

export const MediaGridItemOverlay = ({
  media,
  checked,
}: {
  media: MediaField
  checked: boolean
}) => {
  return (
    <div className="group relative aspect-square h-auto max-w-full cursor-grabbing overflow-hidden rounded-lg bg-ui-bg-subtle-hover shadow-elevation-card-rest outline-none">
      {(media.isThumbnail || media.isBanner) && (
        <div className="absolute left-2 top-2 flex items-center gap-x-1">
          {media.isThumbnail && <ThumbnailBadge />}
          {media.isBanner && <BannerIcon />}
        </div>
      )}

      <div
        className={clx("absolute right-2 top-2 opacity-0 transition-fg", {
          "opacity-100": checked,
        })}
      >
        <Checkbox checked={checked} />
      </div>

      <img src={media.url} alt="" className="size-full object-cover object-center" />
    </div>
  )
}

