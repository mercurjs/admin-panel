import type { HttpTypes } from '@medusajs/types';
import { Button, clx, IconButton, Text, Tooltip } from '@medusajs/ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteFocusModal } from '@components/modals';
import {
  ArrowDownTray,
  ThumbnailBadge,
  Trash,
  TriangleLeftMini,
  TriangleRightMini
} from '@medusajs/icons';
import { useLocation, Link } from 'react-router-dom';
import { useUpdateProductCategoryDetails } from '@hooks/api/categories';
import { BannerIcon } from '@assets/icons/BannerIcon';
import { CategoryDetail } from '@routes/categories/category-detail/types';

type CategoryMediaGalleryProps = {
  category: HttpTypes.AdminProductCategory & {
    category_detail?: CategoryDetail;
  };
};

export const CategoryMediaGallery = ({ category }: CategoryMediaGalleryProps) => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const [curr, setCurr] = useState<number>(state?.curr || 0);

  const { mutate: updateProductCategoryDetails } = useUpdateProductCategoryDetails();

  const categoryDetail = category?.category_detail || {
    media: [],
    thumbnail_id: '',
    icon_id: '',
    banner_id: ''
  };

  const media = getMedia(
    categoryDetail.media || [],
    categoryDetail.thumbnail_id || null,
    categoryDetail.banner_id || null,
    categoryDetail.icon_id || null
  );

  const noMedia = !media.length;

  const handleDeleteCurrent = () => {
    const idToDelete = categoryDetail.media[curr]?.id;

    if (!!idToDelete) {
      const urlToDelete = idToDelete
        ? categoryDetail.media.find(media => media.id === idToDelete)?.url
        : '';

      const isThumbnailToDelete = categoryDetail.thumbnail_id == urlToDelete;
      const isIconToDelete = categoryDetail.icon_id == urlToDelete;
      const isBannerToDelete = categoryDetail.banner_id == urlToDelete;

      updateProductCategoryDetails({
        id: category.id!,
        payload: {
          media: { delete: [idToDelete] },
          thumbnail: isThumbnailToDelete ? '' : categoryDetail.thumbnail_id,
          icon: isIconToDelete ? '' : categoryDetail.icon_id,
          banner: isBannerToDelete ? '' : categoryDetail.banner_id
        }
      });
      setCurr(0);
    }
  };

  const handleDownloadCurrent = () => {
    const a = document.createElement('a') as HTMLAnchorElement & {
      download: string;
    };

    a.href = media[curr].url;
    a.download = 'image';
    a.target = '_blank';

    a.click();
  };

  const next = useCallback(() => {
    setCurr(prev => (prev + 1) % media.length);
  }, [media]);

  const prev = useCallback(() => {
    setCurr(prev => (prev - 1 + media.length) % media.length);
  }, [media]);

  const goTo = useCallback((index: number) => {
    setCurr(index);
  }, []);

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <RouteFocusModal.Header>
        <div className="flex items-center justify-end gap-x-2">
          <IconButton
            size="small"
            type="button"
            onClick={handleDeleteCurrent}
            disabled={noMedia}
          >
            <Trash />
            <span className="sr-only">{t('products.media.deleteImageLabel')}</span>
          </IconButton>
          <IconButton
            size="small"
            type="button"
            onClick={handleDownloadCurrent}
            disabled={noMedia}
          >
            <ArrowDownTray />
            <span className="sr-only">{t('products.media.downloadImageLabel')}</span>
          </IconButton>
          <Button
            variant="secondary"
            size="small"
            asChild
          >
            <Link to={{ pathname: '.', search: 'view=edit' }}>{t('actions.edit')}</Link>
          </Button>
        </div>
      </RouteFocusModal.Header>
      <RouteFocusModal.Body className="flex flex-col overflow-hidden">
        <Canvas
          curr={curr}
          media={media}
        />
        <Preview
          curr={curr}
          media={media}
          prev={prev}
          next={next}
          goTo={goTo}
        />
      </RouteFocusModal.Body>
    </div>
  );
};

const Canvas = ({ media, curr }: { media: Media[]; curr: number }) => {
  const { t } = useTranslation();

  if (media.length === 0) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-y-4 bg-ui-bg-subtle pb-8 pt-6">
        <div className="flex flex-col items-center">
          <Text
            size="small"
            leading="compact"
            weight="plus"
            className="text-ui-fg-subtle"
          >
            {t('products.media.emptyState.header')}
          </Text>
          <Text
            size="small"
            className="text-ui-fg-muted"
          >
            {t('products.media.emptyState.description')}
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          asChild
        >
          <Link to="?view=edit">{t('products.media.emptyState.action')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative size-full overflow-hidden bg-ui-bg-subtle">
      <div className="flex size-full items-center justify-center p-6">
        <div className="relative inline-block max-h-full max-w-full">
          <div className="absolute left-2 top-2 flex items-center gap-x-1">
            {media[curr].isThumbnail && (
              <Tooltip content={t('products.media.thumbnailTooltip')}>
                <ThumbnailBadge />
              </Tooltip>
            )}
            {media[curr].isBanner && (
              <Tooltip content="Banner">
                <BannerIcon />
              </Tooltip>
            )}
          </div>
          <img
            src={media[curr].url}
            alt=""
            className="object-fit max-h-[calc(100vh-200px)] w-auto rounded-xl object-contain shadow-elevation-card-rest"
          />
        </div>
      </div>
    </div>
  );
};

const MAX_VISIBLE_ITEMS = 8;

const Preview = ({
  media,
  curr,
  prev,
  next,
  goTo
}: {
  media: Media[];
  curr: number;
  prev: () => void;
  next: () => void;
  goTo: (index: number) => void;
}) => {
  if (!media.length) {
    return null;
  }

  const getVisibleItems = (media: Media[], index: number) => {
    if (media.length <= MAX_VISIBLE_ITEMS) {
      return media;
    }

    const half = Math.floor(MAX_VISIBLE_ITEMS / 2);
    const start = (index - half + media.length) % media.length;
    const end = (start + MAX_VISIBLE_ITEMS) % media.length;

    if (end < start) {
      return [...media.slice(start), ...media.slice(0, end)];
    } else {
      return media.slice(start, end);
    }
  };

  const visibleItems = getVisibleItems(media, curr);

  return (
    <div className="flex shrink-0 items-center justify-center gap-x-2 border-t p-3">
      <IconButton
        size="small"
        variant="transparent"
        className="text-ui-fg-muted"
        type="button"
        onClick={prev}
      >
        <TriangleLeftMini className="rtl:rotate-180" />
      </IconButton>
      <div className="flex items-center gap-x-2">
        {visibleItems.map(item => {
          const isCurrentImage = item.id === media[curr].id;
          const originalIndex = media.findIndex(i => i.id === item.id);

          return (
            <button
              type="button"
              onClick={() => goTo(originalIndex)}
              className={clx('size-7 overflow-hidden rounded-[4px] outline-none transition-fg', {
                'shadow-borders-focus': isCurrentImage
              })}
              key={item.id}
            >
              <img
                src={item.url}
                alt=""
                className="size-full object-cover"
              />
            </button>
          );
        })}
      </div>
      <IconButton
        size="small"
        variant="transparent"
        className="text-ui-fg-muted"
        type="button"
        onClick={next}
      >
        <TriangleRightMini className="rtl:rotate-180" />
      </IconButton>
    </div>
  );
};

type Media = {
  id: string;
  url: string;
  isThumbnail?: boolean;
  isBanner?: boolean;
};

const getMedia = (
  images: CategoryDetail['media'],
  thumbnail: string | null,
  banner: string | null,
  icon: string | null
) => {
  const media: Media[] =
    images?.map((image: Media) => ({
      id: image.id,
      url: image.url,
      isThumbnail: image.id === thumbnail,
      isBanner: image.id === banner
    })) || [];

  if (thumbnail && !media.some(mediaItem => mediaItem.isThumbnail)) {
    media.unshift({
      id: 'thumbnail_only',
      url: thumbnail,
      isThumbnail: true
    });
  }

  if (banner && !media.some(mediaItem => mediaItem.isBanner)) {
    media.unshift({
      id: 'banner_only',
      url: banner,
      isBanner: true
    });
  }

  return media.filter(mediaItem => mediaItem.id !== icon);
};
