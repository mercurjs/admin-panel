import {
  Avatar,
  Button,
  Container,
  DropdownMenu,
  Heading,
  InlineTip,
  Input,
  Select,
  Text,
  Textarea,
  Tooltip
} from '@medusajs/ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Form } from '../../../../../components/common/form';
import { HandleInput } from '../../../../../components/inputs/handle-input';
import { useDocumentDirection } from '../../../../../hooks/use-document-direction';
import { CreateCategorySchema } from './schema';
import { FileType, FileUpload } from '@components/common/file-upload';
import {
  EllipsisHorizontal,
  InformationCircleSolid,
  QueueList,
  ThumbnailBadge,
  Trash,
  XMarkMini
} from '@medusajs/icons';
import { BannerIcon } from '@assets/icons/BannerIcon';
import { ThumbnailIcon } from '@assets/icons/ThumbnailIcon';

type CreateCategoryDetailsProps = {
  form: UseFormReturn<CreateCategorySchema>;
};

const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/svg+xml'
];

export const CreateCategoryDetails = ({ form }: CreateCategoryDetailsProps) => {
  const { t } = useTranslation();
  const direction = useDocumentDirection();

  const handleMediaChange = (onChange: (value: any) => void, next: FileType[]) => {
    onChange(next.map(m => ({ ...m, isThumbnail: false, isBanner: false })));
  };

  const promoteExclusive = <
    T extends { id: string; url: string; isThumbnail: boolean; isBanner: boolean }
  >(
    list: T[],
    targetId: string,
    flag: 'isThumbnail' | 'isBanner'
  ): T[] => {
    const current = list.find(m => m.id === targetId);
    const nextValue = !current?.[flag];

    return list.map(m => ({
      ...m,
      [flag]: m.id === targetId ? nextValue : false
    }));
  };

  return (
    <div className="flex flex-col items-center p-16">
      <div
        className="flex w-full max-w-[720px] flex-col gap-y-8"
        data-testid="category-create-form-content"
      >
        <div data-testid="category-create-form-header">
          <Heading data-testid="category-create-form-heading">
            {t('categories.create.header')}
          </Heading>
          <Text
            size="small"
            className="text-ui-fg-subtle"
            data-testid="category-create-form-hint"
          >
            {t('categories.create.hint')}
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <Form.Item data-testid="category-create-form-name-item">
                  <Form.Label data-testid="category-create-form-name-label">
                    {t('fields.title')}
                  </Form.Label>
                  <Form.Control data-testid="category-create-form-name-control">
                    <Input
                      autoComplete="off"
                      {...field}
                      data-testid="category-create-form-name-input"
                    />
                  </Form.Control>
                  <Form.ErrorMessage data-testid="category-create-form-name-error" />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="handle"
            render={({ field }) => {
              return (
                <Form.Item data-testid="category-create-form-handle-item">
                  <Form.Label
                    optional
                    tooltip={t('collections.handleTooltip')}
                    data-testid="category-create-form-handle-label"
                  >
                    {t('fields.handle')}
                  </Form.Label>
                  <Form.Control data-testid="category-create-form-handle-control">
                    <HandleInput
                      {...field}
                      data-testid="category-create-form-handle-input"
                    />
                  </Form.Control>
                  <Form.ErrorMessage data-testid="category-create-form-handle-error" />
                </Form.Item>
              );
            }}
          />
        </div>
        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => {
            return (
              <Form.Item data-testid="category-create-form-description-item">
                <Form.Label
                  optional
                  data-testid="category-create-form-description-label"
                >
                  {t('fields.description')}
                </Form.Label>
                <Form.Control data-testid="category-create-form-description-control">
                  <Textarea
                    {...field}
                    data-testid="category-create-form-description-textarea"
                  />
                </Form.Control>
                <Form.ErrorMessage data-testid="category-create-form-description-error" />
              </Form.Item>
            );
          }}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Field
            control={form.control}
            name="status"
            render={({ field: { ref, onChange, ...field } }) => {
              return (
                <Form.Item data-testid="category-create-form-status-item">
                  <Form.Label data-testid="category-create-form-status-label">
                    {t('categories.fields.status.label')}
                  </Form.Label>
                  <Form.Control data-testid="category-create-form-status-control">
                    <Select
                      dir={direction}
                      {...field}
                      onValueChange={onChange}
                      data-testid="category-create-form-status-select"
                    >
                      <Select.Trigger
                        ref={ref}
                        data-testid="category-create-form-status-select-trigger"
                      >
                        <Select.Value data-testid="category-create-form-status-select-value" />
                      </Select.Trigger>
                      <Select.Content data-testid="category-create-form-status-select-content">
                        <Select.Item
                          value="active"
                          data-testid="category-create-form-status-select-option-active"
                        >
                          {t('categories.fields.status.active')}
                        </Select.Item>
                        <Select.Item
                          value="inactive"
                          data-testid="category-create-form-status-select-option-inactive"
                        >
                          {t('categories.fields.status.inactive')}
                        </Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.ErrorMessage data-testid="category-create-form-status-error" />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="visibility"
            render={({ field: { ref, onChange, ...field } }) => {
              return (
                <Form.Item data-testid="category-create-form-visibility-item">
                  <Form.Label data-testid="category-create-form-visibility-label">
                    {t('categories.fields.visibility.label')}
                  </Form.Label>
                  <Form.Control data-testid="category-create-form-visibility-control">
                    <Select
                      dir={direction}
                      {...field}
                      onValueChange={onChange}
                      data-testid="category-create-form-visibility-select"
                    >
                      <Select.Trigger
                        ref={ref}
                        data-testid="category-create-form-visibility-select-trigger"
                      >
                        <Select.Value data-testid="category-create-form-visibility-select-value" />
                      </Select.Trigger>
                      <Select.Content data-testid="category-create-form-visibility-select-content">
                        <Select.Item
                          value="public"
                          data-testid="category-create-form-visibility-select-option-public"
                        >
                          {t('categories.fields.visibility.public')}
                        </Select.Item>
                        <Select.Item
                          value="internal"
                          data-testid="category-create-form-visibility-select-option-internal"
                        >
                          {t('categories.fields.visibility.internal')}
                        </Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.ErrorMessage data-testid="category-create-form-visibility-error" />
                </Form.Item>
              );
            }}
          />
        </div>
      </div>
      <div className="mt-6 w-full max-w-[720px]">
        <Form.Field
          control={form.control}
          name="media"
          render={({ field }) => {
            return (
              <Form.Item data-testid="category-create-form-media-item">
                <Form.Label
                  optional
                  data-testid="category-create-form-media-label"
                >
                  Media
                </Form.Label>
                <Form.Control data-testid="category-create-form-media-control">
                  <FileUpload
                    label="Upload images"
                    hint="Drag and drop images here or click to upload"
                    formats={SUPPORTED_FORMATS}
                    onUploaded={next => handleMediaChange(field.onChange, next)}
                  />
                </Form.Control>
                <Form.ErrorMessage data-testid="category-create-form-media-error" />
              </Form.Item>
            );
          }}
        />
        <div>
          {(form.watch('media') ?? []).map(media => {
            const isThumbnail = !!media.isThumbnail;
            const isBanner = !!media.isBanner;

            return (
              <Container
                key={media.id}
                className="mt-2 flex w-full items-center justify-between gap-x-2 rounded-md bg-ui-bg-component p-2"
              >
                <div className="flex items-center gap-x-2">
                  <Avatar
                    src={media.url}
                    size="small"
                    fallback={media.file.name}
                    variant="squared"
                  />
                  <div>
                    <Text
                      size="small"
                      className="text-ui-fg-base"
                    >
                      {media.file.name}
                    </Text>
                    <div className="flex items-center gap-x-1">
                      {isThumbnail && <ThumbnailBadge />}
                      {isBanner && <BannerIcon />}
                      <Text
                        size="xsmall"
                        className="text-ui-fg-subtle"
                      >
                        {formatFileSize(media.file.size)}
                      </Text>
                    </div>
                  </div>
                </div>
                <div>
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        variant="transparent"
                        size="small"
                        className="p-1"
                      >
                        <EllipsisHorizontal className="text-ui-fg-subtle" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="divide-y py-0">
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
                              form.getValues().media.filter(m => m.id !== media.id),
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
                        form.getValues().media.filter(m => m.id !== media.id),
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
        <div className="mt-6">
          {form.watch().icon ? (
            <Container className="mt-2 flex w-full items-center justify-between gap-x-2 rounded-md bg-ui-bg-component p-2">
              <div className="flex items-center gap-x-2">
                <Avatar
                  src={form.watch().icon?.[0].url}
                  size="small"
                  fallback={form.watch().icon?.[0].file.name ?? ''}
                  variant="squared"
                />
                <div>
                  <Text
                    size="small"
                    className="text-ui-fg-base"
                  >
                    {form.watch().icon?.[0].file.name}
                  </Text>
                  <div className="flex items-center gap-x-1">
                    <Text
                      size="xsmall"
                      className="text-ui-fg-subtle"
                    >
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

          <InlineTip
            label="Tip"
            className="mt-2"
          >
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
