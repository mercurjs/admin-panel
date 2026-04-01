import { BannerIcon } from "@assets/icons/BannerIcon"
import { ActionMenu } from "@components/common/action-menu"
import { PencilSquare, ThumbnailBadge } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Heading, Tooltip, Text } from "@medusajs/ui"
import { CategoryDetail } from "@routes/categories/common/types"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"


type CategoryMediaSectionProps = {
    category: HttpTypes.AdminProductCategory & { category_detail?: CategoryDetail }
  }

export const CategoryMediaSection = ({ category }: CategoryMediaSectionProps) => {
  const { t } = useTranslation()
  console.log({ category })

  const iconId = category?.category_detail?.icon_id ?? ""
  const thumbnailId = category?.category_detail?.thumbnail_id ?? ""
  const bannerId = category?.category_detail?.banner_id ?? ""
  const baseMedia = category?.category_detail?.media.filter(item => item.url !== category.category_detail?.icon_id) ?? []

  // If the icon is part of media, exclude it from the grid.
  const media = iconId ? baseMedia.filter((m) => m.id !== iconId) : baseMedia
  
  return (
    <>
      <Container className="divide-y p-0" data-testid="collection-media-section">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Media</Heading>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t("actions.edit"),
                    to: "media?view=edit",
                    icon: <PencilSquare />,
                  },
                ],
              },
            ]}
            data-testid="collection-media-action-menu"
          />
        </div>

        {media.length > 0 ? (
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-4 px-6 py-4"
            data-testid="collection-media-grid"
          >
            {media.map((i, index) => {
              const isThumbnail = !!thumbnailId && i.url === thumbnailId
              const isBanner = !!bannerId && i.url === bannerId

              return (
                <div
                  className="shadow-elevation-card-rest hover:shadow-elevation-card-hover transition-fg group relative aspect-square size-full cursor-pointer overflow-hidden rounded-[8px]"
                  key={i.id}
                  data-testid={`collection-media-item-${i.id}`}
                >
                  <div className="absolute left-2 top-2 flex items-center gap-x-1">
                    {isThumbnail && (
                      <div data-testid={`collection-media-thumbnail-badge-${i.id}`}>
                        <Tooltip content={t("fields.thumbnail")}>
                          <ThumbnailBadge />
                        </Tooltip>
                      </div>
                    )}
                    {isBanner && (
                      <div data-testid={`collection-media-banner-badge-${i.id}`}>
                        <Tooltip content="Banner">
                          <BannerIcon />
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  <Link to="media" state={{ curr: index }} data-testid={`collection-media-link-${i.id}`}>
                    <img
                      src={i.url}
                      alt={i.alt_text || `Collection media ${index + 1}`}
                      className="size-full object-cover"
                      data-testid={`collection-media-image-${i.id}`}
                    />
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-y-4 pb-10 pt-10" data-testid="collection-media-empty-state">
            <div className="flex flex-col items-center">
              <Text
                size="small"
                leading="compact"
                weight="plus"
                className="text-ui-fg-subtle"
                data-testid="collection-media-empty-state-header"
              >
                {t("products.media.emptyState.header")}
              </Text>
              <Text size="small" className="text-ui-fg-muted" data-testid="collection-media-empty-state-description">
                Add media to showcase it on the storefront.
              </Text>
            </div>
          </div>
        )}
      </Container>
      <Container className="divide-y p-0" data-testid="collection-media-section">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Icon</Heading>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t("actions.edit"),
                    to: "media?view=edit&type=icon",
                    icon: <PencilSquare />,
                  },
                ],
              },
            ]}
            data-testid="collection-media-action-menu"
          />
        </div>
        {iconId ? (
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-4 px-6 py-4"
            data-testid="collection-media-grid"
          >
                <div
                  className="shadow-elevation-card-rest transition-fg group relative aspect-square size-full cursor-pointer overflow-hidden rounded-[8px]"
                  data-testid={`collection-icon`}
                >
                    <img
                      src={iconId}
                      alt="Collection icon"
                      className="size-full object-cover"
                      data-testid={`collection-icon-image`}
                    />
                </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-y-4 pb-10 pt-10" data-testid="collection-media-empty-state">
          <div className="flex flex-col items-center">
            <Text
              size="small"
              leading="compact"
              weight="plus"
              className="text-ui-fg-subtle"
              data-testid="collection-media-empty-state-header"
            >
              No icon yet
            </Text>
            <Text size="small" className="text-ui-fg-muted" data-testid="collection-media-empty-state-description">
              Add icon to showcase it near the collection label on the storefront.
            </Text>
          </div>
        </div>
        )}
      </Container>
    </>
  )
}