import {
  Avatar,
  Button,
  Container,
  DropdownMenu,
  Heading,
  InlineTip,
  Input,
  Text,
  Tooltip
} from '@medusajs/ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';

import { Form } from '../../../../../components/common/form';
import { HandleInput } from '../../../../../components/inputs/handle-input';
import { FileType, FileUpload } from '@components/common/file-upload';
import {
  EllipsisHorizontal,
  InformationCircleSolid,
  QueueList,
  ThumbnailBadge,
  Trash,
  XMarkMini
} from '@medusajs/icons';
import { ThumbnailIcon } from '@assets/icons/ThumbnailIcon';
import { BannerIcon } from '@assets/icons/BannerIcon';
import {
  collectionMediaType,
  CreateCollectionSchema,
  MediaItem
} from '../create-collelction-modal/create-collection-modal';

const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/svg+xml'
];

const promoteExclusive = (
  list: MediaItem[],
  targetId: string,
  flag: 'isThumbnail' | 'isBanner'
): MediaItem[] => {
  const current = list.find(m => m.id === targetId);
  const nextValue = !current?.[flag];

  // Only one item can hold the flag; clear all, then set the selected (or none if removing).
  return list.map(m => ({
    ...m,
    [flag]: m.id === targetId ? nextValue : false
  }));
};

export const CreateCollectionForm = ({
  form
}: {
  form: UseFormReturn<zod.infer<typeof CreateCollectionSchema> & collectionMediaType>;
}) => {
  const { t } = useTranslation();

  const handleMediaChange = (onChange: (value: any) => void, next: FileType[]) => {
    onChange(next.map(m => ({ ...m, isThumbnail: false, isBanner: false })));
  }

  return (
    <div className="flex size-full flex-col items-center p-16">
      <div
        className="flex w-full max-w-[720px] flex-col gap-y-8"
        data-testid="collection-create-form-content"
      >
        <div data-testid="collection-create-form-header">
          <Heading data-testid="collection-create-form-heading">
            {t('collections.createCollection')}
          </Heading>
          <Text
            size="small"
            className="text-ui-fg-subtle"
            data-testid="collection-create-form-hint"
          >
            {t('collections.createCollectionHint')}
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Field
            control={form.control}
            name="title"
            render={({ field }) => {
              return (
                <Form.Item data-testid="collection-create-form-title-item">
                  <Form.Label data-testid="collection-create-form-title-label">
                    {t('fields.title')}
                  </Form.Label>
                  <Form.Control data-testid="collection-create-form-title-control">
                    <Input
                      autoComplete="off"
                      {...field}
                      data-testid="collection-create-form-title-input"
                    />
                  </Form.Control>
                  <Form.ErrorMessage data-testid="collection-create-form-title-error" />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="handle"
            render={({ field }) => {
              return (
                <Form.Item data-testid="collection-create-form-handle-item">
                  <Form.Label
                    optional
                    tooltip={t('collections.handleTooltip')}
                    data-testid="collection-create-form-handle-label"
                  >
                    {t('fields.handle')}
                  </Form.Label>
                  <Form.Control data-testid="collection-create-form-handle-control">
                    <HandleInput {...field} data-testid="collection-create-form-handle-input" />
                  </Form.Control>
                  <Form.ErrorMessage data-testid="collection-create-form-handle-error" />
                </Form.Item>
              );
            }}
          />
        </div>
        <div>
          <Form.Field
            control={form.control}
            name="media"
            render={({ field }) => (
              <Form.Item>
                <Form.Label optional>Media</Form.Label>
                <Form.Control>
                  <FileUpload
                    label="Upload images"
                    hint="Drag and drop images here or click to upload"
                    formats={SUPPORTED_FORMATS}
                    onUploaded={next => handleMediaChange(field.onChange, next)}
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <div>
            {form.watch().media.map(media => {
              const isThumbnail = !!(media).isThumbnail;
              const isBanner = !!(media).isBanner;

              return (
                <Container
                  key={media.id}
                  className="flex items-center justify-between gap-x-2 w-full bg-ui-bg-component rounded-md p-2 mt-2"
                >
                  <div className="flex items-center gap-x-2">
                    <Avatar
                      src={media.url}
                      size="small"
                      fallback={media.file.name}
                      variant="squared"
                    />
                    <div>
                      <Text size="small" className="text-ui-fg-base">
                        {media.file.name}
                      </Text>
                      <div className="flex items-center gap-x-1">
                        {isThumbnail && <ThumbnailBadge />}
                        {isBanner && <BannerIcon />}
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          {formatFileSize(media.file.size)}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div>
                    <DropdownMenu>
                      <DropdownMenu.Trigger asChild>
                        <Button variant="transparent" size="small" className="p-1">
                          <EllipsisHorizontal className="text-ui-fg-subtle" />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content className="divide-y py-0 ">
                        <DropdownMenu.Group className="py-1">
                          <DropdownMenu.Item
                            className="justify-between"
                            onClick={() => {
                              form.setValue(
                                'media',
                                promoteExclusive(form.getValues().media, media.id, 'isThumbnail'),
                                { shouldDirty: true }
                              );
                            }}
                          >
                            <div className="flex items-center gap-x-2 text-ui-fg-subtle">
                              <ThumbnailIcon />
                              <span>{isThumbnail ? 'Remove thumbnail' : 'Make thumbnail'}</span>
                            </div>
                            <Tooltip content="This will appear on the homepage.">
                              <InformationCircleSolid className="text-ui-fg-subtle" />
                            </Tooltip>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="justify-between"
                            onClick={() => {
                              form.setValue(
                                'media',
                                promoteExclusive(form.getValues().media, media.id, 'isBanner'),
                                { shouldDirty: true }
                              );
                            }}
                          >
                            <div className="flex items-center gap-x-2 text-ui-fg-subtle">
                              <QueueList />
                              <span>{isBanner ? 'Remove banner' : 'Make banner'}</span>
                            </div>
                            <Tooltip content="This will appear on the collection listing.">
                              <InformationCircleSolid className="text-ui-fg-subtle" />
                            </Tooltip>
                          </DropdownMenu.Item>
                        </DropdownMenu.Group>
                        <DropdownMenu.Group className="py-1">
                          <DropdownMenu.Item
                            className="gap-x-2 text-ui-fg-subtle"
                            onClick={() =>
                              form.setValue(
                                'media',
                                form.getValues().media.filter((m: MediaItem) => m.id !== media.id),
                                { shouldDirty: true }
                              )
                            }
                          >
                            <Trash />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu>
                    <Button
                      variant="transparent"
                      size="small"
                      className="p-1"
                      onClick={() =>
                        form.setValue(
                          'media',
                          form.getValues().media.filter((m: MediaItem) => m.id !== media.id),
                          { shouldDirty: true }
                        )
                      }
                    >
                      <XMarkMini className="text-ui-fg-subtle" />
                    </Button>
                  </div>
                </Container>
              );
            })}
          </div>
        </div>
        <div>
          {form.watch().icon ? (
            <Container className="flex items-center justify-between gap-x-2 w-full bg-ui-bg-component rounded-md p-2 mt-2">
              <div className="flex items-center gap-x-2">
                <Avatar
                  src={form.watch().icon?.[0].url}
                  size="small"
                  fallback={form.watch().icon?.[0].file.name ?? ''}
                  variant="squared"
                />
                <div>
                  <Text size="small" className="text-ui-fg-base">
                    {form.watch().icon?.[0].file.name}
                  </Text>
                  <div className="flex items-center gap-x-1">
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {formatFileSize(form.watch().icon?.[0].file.size ?? 0)}
                    </Text>
                  </div>
                </div>
              </div>
              <Button
                variant="transparent"
                size="small"
                className="p-1"
                onClick={() => form.setValue('icon', null)}
              >
                <XMarkMini className="text-ui-fg-subtle" />
              </Button>
            </Container>
          ) : (
            <Form.Field
              control={form.control}
              name="icon"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label optional>Icon</Form.Label>
                  <Form.Control>
                    <FileUpload
                      label="Upload images"
                      multiple={false}
                      hint="Drag and drop images here or click to upload"
                      formats={SUPPORTED_FORMATS}
                      onUploaded={field.onChange}
                    />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
          )}

          <InlineTip label="Tip" className="mt-2">
            This icon will appear near the collection label on the storefront.
          </InlineTip>
        </div>
      </div>
    </div>
  );
};

function formatFileSize(bytes: number, decimalPlaces: number = 2): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPlaces)) + ' ' + sizes[i];
}
