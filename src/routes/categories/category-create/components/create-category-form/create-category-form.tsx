import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ProgressStatus, ProgressTabs, toast } from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useState } from 'react';
import { RouteFocusModal, useRouteModal } from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import {
  useCreateProductCategory,
  useUpdateProductCategoryDetails
} from '../../../../../hooks/api/categories';
import { transformNullableFormData } from '../../../../../lib/form-helpers';
import { CreateCategoryDetails } from './create-category-details';
import { CreateCategoryNesting } from './create-category-nesting';
import { CreateCategoryDetailsSchema, CreateCategorySchema } from './schema';
import { useDocumentDirection } from '../../../../../hooks/use-document-direction';
import { FileType } from '@components/common/file-upload';
import { sdk } from '@lib/client';

export type MediaItem = FileType & {
  isThumbnail: boolean;
  isBanner: boolean;
};

export type collectionMediaType = {
  media: MediaItem[];
  icon: FileType[] | null;
};

type CreateCategoryFormProps = {
  parentCategoryId: string | null;
};

enum Tab {
  DETAILS = 'details',
  ORGANIZE = 'organize'
}

export const CreateCategoryForm = ({ parentCategoryId }: CreateCategoryFormProps) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const direction = useDocumentDirection();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DETAILS);
  const [validDetails, setValidDetails] = useState(false);
  const [shouldFreeze, setShouldFreeze] = useState(false);

  const form = useForm<CreateCategorySchema>({
    defaultValues: {
      name: '',
      description: '',
      handle: '',
      status: 'active',
      visibility: 'public',
      media: [],
      icon: null,
      rank: parentCategoryId ? 0 : null,
      parent_category_id: parentCategoryId
    },
    resolver: zodResolver(CreateCategorySchema)
  });

  const handleTabChange = (tab: Tab) => {
    if (tab === Tab.ORGANIZE) {
      const { name, handle, description, status, visibility, media, icon } = form.getValues();

      const result = CreateCategoryDetailsSchema.safeParse({
        name,
        handle,
        description,
        status,
        visibility,
        media,
        icon
      });

      if (!result.success) {
        result.error.errors.forEach(error => {
          form.setError(error.path.join('.') as keyof CreateCategorySchema, {
            type: 'manual',
            message: error.message
          });
        });

        return;
      }

      form.clearErrors();
      setValidDetails(true);
    }

    setActiveTab(tab);
  };

  const { mutateAsync, isPending } = useCreateProductCategory();

  const { mutateAsync: postCategoryDetailsMutation } = useUpdateProductCategoryDetails();

  const handleSubmit = form.handleSubmit(data => {
    const { visibility, status, parent_category_id, rank, name, media, icon, ...rest } = data;
    const parsedData = transformNullableFormData(rest, false);

    setShouldFreeze(true);

    mutateAsync(
      {
        name: name,
        ...parsedData,
        parent_category_id: parent_category_id ?? undefined,
        rank: rank ?? undefined,
        is_active: status === 'active',
        is_internal: visibility === 'internal'
      },
      {
        onSuccess: async ({ product_category }) => {
          if (media.length > 0) {
            const { files: uploads } = await sdk.admin.upload
              .create({ files: media.map(m => m.file) as unknown as File[] })
              .catch(() => {
                return { files: [] };
              });

            const mediaToCreate = uploads.map((item: { id: string; url: string }) => ({
              url: item.url,
              alt_text: ''
            }));

            const thumbnailIndex = media.findIndex(m => !!m.isThumbnail);
            const bannerIndex = media.find(m => !!m.isBanner)
              ? media.findIndex(m => !!m.isBanner)
              : undefined;

            const thumbnail =
              thumbnailIndex >= 0
                ? { url: mediaToCreate[thumbnailIndex]?.url }
                : { url: mediaToCreate[0]?.url };
            const banner = bannerIndex ? { url: mediaToCreate[bannerIndex]?.url } : undefined;

            let create = mediaToCreate;

            const indexesToBeRemoved = [thumbnailIndex, bannerIndex].filter(Boolean);

            while (indexesToBeRemoved.length) {
              create.splice(indexesToBeRemoved.pop() as number, 1);
            }

            await postCategoryDetailsMutation({
              id: product_category.id,
              payload: {
                media: { delete: [], create },
                thumbnail,
                banner
              }
            });
          }

          if (icon?.length) {
            const { files: uploadedIcon } = await sdk.admin.upload
              .create({
                files: icon.map(i => i.file) as unknown as File[]
              })
              .catch(() => {
                form.setError('media', {
                  type: 'invalid_file',
                  message: t('products.media.failedToUpload')
                });
                return { files: [] };
              });
            await postCategoryDetailsMutation({
              id: product_category.id,
              payload: {
                media: { delete: [], create: [] },
                icon: { url: uploadedIcon[0]?.url }
              }
            });
          }

          toast.success(
            t('categories.create.successToast', {
              name: product_category.name
            })
          );

          handleSuccess(`/categories/${product_category.id}`);
        },
        onError: error => {
          toast.error(error.message);
          setShouldFreeze(false);
        }
      }
    );
  });

  const nestingStatus: ProgressStatus =
    form.getFieldState('parent_category_id')?.isDirty ||
    form.getFieldState('rank')?.isDirty ||
    activeTab === Tab.ORGANIZE
      ? 'in-progress'
      : 'not-started';

  const detailsStatus: ProgressStatus = validDetails ? 'completed' : 'in-progress';

  return (
    <RouteFocusModal.Form
      form={form}
      data-testid="category-create-form"
    >
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex size-full flex-col overflow-hidden"
      >
        <ProgressTabs
          dir={direction}
          value={activeTab}
          onValueChange={tab => handleTabChange(tab as Tab)}
          className="flex size-full flex-col"
        >
          <RouteFocusModal.Header data-testid="category-create-form-header">
            <div className="flex w-full items-center justify-between">
              <div className="-my-2 w-full max-w-[400px] border-l">
                <ProgressTabs.List
                  className="grid w-full grid-cols-2"
                  data-testid="category-create-form-tabs-list"
                >
                  <ProgressTabs.Trigger
                    value={Tab.DETAILS}
                    status={detailsStatus}
                    className="w-full min-w-0 overflow-hidden"
                    data-testid="category-create-form-tab-details"
                  >
                    <span className="truncate">{t('categories.create.tabs.details')}</span>
                  </ProgressTabs.Trigger>
                  <ProgressTabs.Trigger
                    value={Tab.ORGANIZE}
                    status={nestingStatus}
                    className="w-full min-w-0 overflow-hidden"
                    data-testid="category-create-form-tab-organize"
                  >
                    <span className="truncate">{t('categories.create.tabs.organize')}</span>
                  </ProgressTabs.Trigger>
                </ProgressTabs.List>
              </div>
            </div>
          </RouteFocusModal.Header>
          <RouteFocusModal.Body
            className="flex size-full flex-col overflow-auto"
            data-testid="category-create-form-body"
          >
            <ProgressTabs.Content
              value={Tab.DETAILS}
              data-testid="category-create-form-tab-details-content"
            >
              <CreateCategoryDetails form={form} />
            </ProgressTabs.Content>
            <ProgressTabs.Content
              value={Tab.ORGANIZE}
              className="flex-1 bg-ui-bg-subtle"
              data-testid="category-create-form-tab-organize-content"
            >
              <CreateCategoryNesting
                form={form}
                shouldFreeze={shouldFreeze}
              />
            </ProgressTabs.Content>
          </RouteFocusModal.Body>
          <RouteFocusModal.Footer data-testid="category-create-form-footer">
            <div className="flex items-center justify-end gap-x-2">
              <RouteFocusModal.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  data-testid="category-create-form-cancel-button"
                >
                  {t('actions.cancel')}
                </Button>
              </RouteFocusModal.Close>
              {activeTab === Tab.ORGANIZE ? (
                <Button
                  key="submit-btn"
                  size="small"
                  variant="primary"
                  type="submit"
                  isLoading={isPending}
                  data-testid="category-create-form-save-button"
                >
                  {t('actions.save')}
                </Button>
              ) : (
                <Button
                  key="continue-btn"
                  size="small"
                  variant="primary"
                  type="button"
                  onClick={() => handleTabChange(Tab.ORGANIZE)}
                  data-testid="category-create-form-continue-button"
                >
                  {t('actions.continue')}
                </Button>
              )}
            </div>
          </RouteFocusModal.Footer>
        </ProgressTabs>
      </KeyboundForm>
    </RouteFocusModal.Form>
  );
};
