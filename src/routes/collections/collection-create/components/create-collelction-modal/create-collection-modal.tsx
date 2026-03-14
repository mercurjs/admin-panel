import { FileType } from '@components/common/file-upload';
import { RouteFocusModal, useRouteModal } from '@components/modals';
import { KeyboundForm } from '@components/utilities/keybound-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDocumentDirection } from '@hooks/use-document-direction';
import { Button, ProgressStatus, ProgressTabs, toast } from '@medusajs/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import zod from 'zod';
import { CreateCollectionForm } from '../create-collection-form';
import { useCreateCollection, usePostCollectionDetails } from '@hooks/api';
import { CreateCollectionRank } from '../create-collection-rank/create-collection-rank';
import { sdk } from '@lib/client';

export const CreateCollectionSchema = zod.object({
  title: zod.string().min(1),
  handle: zod.string().optional(),
  rank: zod.number().nullable().default(null),
  media: zod
    .array(
      zod.object({
        id: zod.string(),
        url: zod.string(),
        isThumbnail: zod.boolean().optional(),
        isBanner: zod.boolean().optional(),
        file: zod.any()
      })
    )
    .default([]),
  icon: zod
    .array(
      zod.object({
        id: zod.string(),
        url: zod.string(),
        file: zod.any()
      })
    )
    .nullable()
    .default(null)
});

export type MediaItem = FileType & {
  isThumbnail?: boolean;
  isBanner?: boolean;
};

export type collectionMediaType = {
  media: MediaItem[];
  icon: FileType[] | null;
};

enum Tab {
  DETAILS = 'details',
  ORGANIZE = 'organize'
}

export const CreateCollectionModal = () => {
  const { t } = useTranslation();
  const direction = useDocumentDirection();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DETAILS);
  const [validDetails, setValidDetails] = useState(false);
  const [shouldFreeze, setShouldFreeze] = useState(false);

  const { handleSuccess } = useRouteModal();

  const { mutateAsync, isPending } = useCreateCollection();

  const { mutateAsync: postCollectionDetailsMutation } = usePostCollectionDetails();

  const form = useForm<zod.infer<typeof CreateCollectionSchema> & collectionMediaType>({
    defaultValues: {
      title: '',
      handle: '',
      media: [],
      icon: null,
      rank: null
    },
    resolver: zodResolver(CreateCollectionSchema)
  });

  const handleSubmit = form.handleSubmit(async data => {
    setShouldFreeze(true);
    const { title, handle, rank, media, icon } = data;

    await mutateAsync(
      { title, handle },
      {
        onSuccess: async ({ collection }) => {
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
              const bannerIndex = media.find(m => !!m.isBanner) ? media.findIndex(m => !!m.isBanner) : undefined;

              const thumbnail =
                thumbnailIndex >= 0
                  ? { url: mediaToCreate[thumbnailIndex]?.url }
                  : { url: mediaToCreate[0]?.url };
              const banner = bannerIndex ? { url: mediaToCreate[bannerIndex]?.url } : undefined;

              let create = mediaToCreate

              const indexesToBeRemoved = [thumbnailIndex, bannerIndex].filter(Boolean);
    
              while(indexesToBeRemoved.length) {
                create.splice(indexesToBeRemoved.pop() as number, 1);
              }

              await postCollectionDetailsMutation({
                id: collection.id,
                payload: {
                  media: { delete: [], create },
                  rank: rank ?? 0,
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
            await postCollectionDetailsMutation({
              id: collection.id,
              payload: {
                media: { delete: [], create: [] },
                rank: rank ?? 0,
                icon: {url: uploadedIcon[0]?.url}
              }
            });
          }

          handleSuccess(`/collections/${collection.id}`);
          toast.success(t('collections.createSuccess'));
        },
        onError: error => {
          toast.error(error.message);
          setShouldFreeze(false);
        }
      }
    );
  });

  const handleTabChange = (tab: Tab) => {
    if (tab === Tab.ORGANIZE) {
      const { title } = form.getValues();

      const result = CreateCollectionSchema.safeParse({
        title
      });

      if (!result.success) {
        result.error.errors.forEach(error => {
          form.setError(error.path.join('.') as keyof zod.infer<typeof CreateCollectionSchema>, {
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

  const nestingStatus: ProgressStatus = activeTab === Tab.ORGANIZE ? 'in-progress' : 'not-started';

  const detailsStatus: ProgressStatus = validDetails ? 'completed' : 'in-progress';

  return (
    <RouteFocusModal.Form form={form} data-testid="collection-create-form">
      <KeyboundForm onSubmit={handleSubmit} className="flex size-full flex-col overflow-hidden">
        <ProgressTabs
          dir={direction}
          value={activeTab}
          onValueChange={tab => handleTabChange(tab as Tab)}
          className="flex size-full flex-col"
        >
          <RouteFocusModal.Header data-testid="collection-create-form-header">
            <div className="flex w-full items-center justify-between">
              <div className="-my-2 w-full max-w-[400px] border-l">
                <ProgressTabs.List
                  className="grid w-full grid-cols-2"
                  data-testid="collection-create-form-tabs-list"
                >
                  <ProgressTabs.Trigger
                    value={Tab.DETAILS}
                    status={detailsStatus}
                    className="w-full min-w-0 overflow-hidden"
                    data-testid="collection-create-form-tab-details"
                  >
                    <span className="truncate">{t('categories.create.tabs.details')}</span>
                  </ProgressTabs.Trigger>
                  <ProgressTabs.Trigger
                    value={Tab.ORGANIZE}
                    status={nestingStatus}
                    className="w-full min-w-0 overflow-hidden"
                    data-testid="collection-create-form-tab-organize"
                  >
                    <span className="truncate">{t('categories.create.tabs.organize')}</span>
                  </ProgressTabs.Trigger>
                </ProgressTabs.List>
              </div>
            </div>
          </RouteFocusModal.Header>
          <RouteFocusModal.Body
            className="flex size-full flex-col overflow-auto"
            data-testid="collection-create-form-body"
          >
            <ProgressTabs.Content
              value={Tab.DETAILS}
              data-testid="collection-create-form-tab-details-content"
            >
              <CreateCollectionForm form={form} />
            </ProgressTabs.Content>
            <ProgressTabs.Content
              value={Tab.ORGANIZE}
              className="bg-ui-bg-subtle flex-1"
              data-testid="collection-create-form-tab-organize-content"
            >
              <CreateCollectionRank form={form} shouldFreeze={shouldFreeze} />
            </ProgressTabs.Content>
          </RouteFocusModal.Body>
          <RouteFocusModal.Footer data-testid="collection-create-form-footer">
            <RouteFocusModal.Close asChild>
              <Button
                size="small"
                variant="secondary"
                data-testid="collection-create-form-cancel-button"
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
                data-testid="collection-create-form-save-button"
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
                data-testid="collection-create-form-continue-button"
              >
                {t('actions.continue')}
              </Button>
            )}
          </RouteFocusModal.Footer>
        </ProgressTabs>
      </KeyboundForm>
    </RouteFocusModal.Form>
  );
};
