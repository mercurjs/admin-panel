import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import { ConditionalTooltip } from '@components/common/conditional-tooltip';
import { Form } from '@components/common/form';
import { Skeleton } from '@components/common/skeleton';
import { RouteDrawer, useRouteModal } from '@components/modals';
import { KeyboundForm } from '@components/utilities/keybound-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDocumentDirection } from '@hooks/use-document-direction';
import { ArrowDownMini, ArrowUpMini, EllipsisVertical, Trash } from '@medusajs/icons';
import { FetchError } from '@medusajs/js-sdk';
import { Button, clx, DropdownMenu, Heading, IconButton, InlineTip, toast } from '@medusajs/ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type MetaDataSubmitHook<TRes> = (
  params: { metadata?: Record<string, unknown> | null },
  callbacks: { onSuccess?: () => void; onError?: (error: FetchError | string) => void }
) => Promise<TRes>;

type MetadataFormProps<TRes> = {
  metadata?: Record<string, unknown> | null;
  hook: MetaDataSubmitHook<TRes>;
  isPending: boolean;
  isMutating: boolean;
};

const MetadataFieldSchema = z.object({
  key: z.string(),
  disabled: z.boolean().optional(),
  value: z.any()
});

const MetadataSchema = z.object({
  metadata: z.array(MetadataFieldSchema)
});

export const MetadataForm = <TRes,>(props: MetadataFormProps<TRes>) => {
  const { t } = useTranslation();
  const { isPending, ...innerProps } = props;

  return (
    <RouteDrawer data-testid="metadata-form-drawer">
      <RouteDrawer.Header data-testid="metadata-form-drawer-header">
        <RouteDrawer.Title
          asChild
          data-testid="metadata-form-drawer-title-wrapper"
        >
          <Heading data-testid="metadata-form-drawer-title">{t('metadata.edit.header')}</Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description
          className="sr-only"
          data-testid="metadata-form-drawer-description"
        >
          {t('metadata.edit.description')}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      {isPending ? <PlaceholderInner /> : <InnerForm {...innerProps} />}
    </RouteDrawer>
  );
};

const METADATA_KEY_LABEL_ID = 'metadata-form-key-label';
const METADATA_VALUE_LABEL_ID = 'metadata-form-value-label';

const InnerForm = <TRes,>({
  metadata,
  hook,
  isMutating
}: Omit<MetadataFormProps<TRes>, 'isPending'>) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const direction = useDocumentDirection();
  const hasUneditableRows = getHasUneditableRows(metadata);

  const form = useForm<z.infer<typeof MetadataSchema>>({
    defaultValues: {
      metadata: getDefaultValues(metadata)
    },
    resolver: zodResolver(MetadataSchema)
  });

  const handleSubmit = form.handleSubmit(async data => {
    const parsedData = parseValues(data, metadata);

    await hook(
      {
        metadata: parsedData
      },
      {
        onSuccess: () => {
          toast.success(t('metadata.edit.successToast'));
          handleSuccess();
        },
        onError: error => {
          toast.error(error instanceof FetchError ? error.message : error);
        }
      }
    );
  });

  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: 'metadata'
  });

  function deleteRow(index: number) {
    remove(index);

    // If the last row is deleted, add a new blank row
    if (fields.length === 1) {
      insert(0, {
        key: '',
        value: '',
        disabled: false
      });
    }
  }

  function insertRow(index: number, position: 'above' | 'below') {
    insert(index + (position === 'above' ? 0 : 1), {
      key: '',
      value: '',
      disabled: false
    });
  }

  return (
    <RouteDrawer.Form
      form={form}
      data-testid="metadata-form"
    >
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
        data-testid="metadata-keybound-form"
      >
        <RouteDrawer.Body
          className="flex flex-1 flex-col gap-y-8 overflow-y-auto"
          data-testid="metadata-form-body"
        >
          <div
            className="grid grid-cols-1 divide-y rounded-lg bg-ui-bg-base shadow-elevation-card-rest"
            data-testid="metadata-form-table"
          >
            <div
              className="grid grid-cols-2 divide-x rounded-t-lg bg-ui-bg-subtle"
              data-testid="metadata-form-table-header"
            >
              <div
                className="txt-compact-small-plus px-2 py-1.5 text-ui-fg-subtle"
                data-testid="metadata-form-table-header-key"
              >
                <label id={METADATA_KEY_LABEL_ID}>{t('metadata.edit.labels.key')}</label>
              </div>
              <div
                className="txt-compact-small-plus px-2 py-1.5 text-ui-fg-subtle"
                data-testid="metadata-form-table-header-value"
              >
                <label id={METADATA_VALUE_LABEL_ID}>{t('metadata.edit.labels.value')}</label>
              </div>
            </div>
            {fields.map((field, index) => {
              const isDisabled = field.disabled || false;
              let placeholder = '-';

              if (typeof field.value === 'object') {
                placeholder = '{ ... }';
              }

              if (Array.isArray(field.value)) {
                placeholder = '[ ... ]';
              }

              return (
                <ConditionalTooltip
                  showTooltip={isDisabled}
                  content={t('metadata.edit.complexRow.tooltip')}
                  key={field.id}
                >
                  <div
                    className="group/table relative"
                    data-testid={`metadata-form-row-${index}`}
                  >
                    <div
                      className={clx('grid grid-cols-2 divide-x', {
                        'overflow-hidden rounded-b-lg': index === fields.length - 1
                      })}
                      data-testid={`metadata-form-row-${index}-content`}
                    >
                      <Form.Field
                        control={form.control}
                        name={`metadata.${index}.key`}
                        render={({ field }) => {
                          return (
                            <Form.Item data-testid={`metadata-form-row-${index}-key-item`}>
                              <Form.Control data-testid={`metadata-form-row-${index}-key-control`}>
                                <GridInput
                                  aria-labelledby={METADATA_KEY_LABEL_ID}
                                  {...field}
                                  disabled={isDisabled}
                                  placeholder="Key"
                                  data-testid={`metadata-form-row-${index}-key-input`}
                                />
                              </Form.Control>
                            </Form.Item>
                          );
                        }}
                      />
                      <Form.Field
                        control={form.control}
                        name={`metadata.${index}.value`}
                        render={({ field: { value, ...field } }) => {
                          return (
                            <Form.Item data-testid={`metadata-form-row-${index}-value-item`}>
                              <Form.Control
                                data-testid={`metadata-form-row-${index}-value-control`}
                              >
                                <GridInput
                                  aria-labelledby={METADATA_VALUE_LABEL_ID}
                                  {...field}
                                  value={isDisabled ? placeholder : value}
                                  disabled={isDisabled}
                                  placeholder="Value"
                                  data-testid={`metadata-form-row-${index}-value-input`}
                                />
                              </Form.Control>
                            </Form.Item>
                          );
                        }}
                      />
                    </div>
                    <DropdownMenu
                      dir={direction}
                      data-testid={`metadata-form-row-${index}-actions-menu`}
                    >
                      <DropdownMenu.Trigger
                        className={clx(
                          "invisible absolute inset-y-0 -end-2.5 my-auto group-hover/table:visible data-[state='open']:visible",
                          {
                            hidden: isDisabled
                          }
                        )}
                        disabled={isDisabled}
                        asChild
                        data-testid={`metadata-form-row-${index}-actions-menu-trigger`}
                      >
                        <IconButton
                          size="2xsmall"
                          data-testid={`metadata-form-row-${index}-actions-menu-button`}
                        >
                          <EllipsisVertical />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content
                        data-testid={`metadata-form-row-${index}-actions-menu-content`}
                      >
                        <DropdownMenu.Item
                          className="gap-x-2"
                          onClick={() => insertRow(index, 'above')}
                          data-testid={`metadata-form-row-${index}-action-insert-above`}
                        >
                          <ArrowUpMini className="text-ui-fg-subtle" />
                          {t('metadata.edit.actions.insertRowAbove')}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="gap-x-2"
                          onClick={() => insertRow(index, 'below')}
                          data-testid={`metadata-form-row-${index}-action-insert-below`}
                        >
                          <ArrowDownMini className="text-ui-fg-subtle" />
                          {t('metadata.edit.actions.insertRowBelow')}
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator
                          data-testid={`metadata-form-row-${index}-actions-menu-separator`}
                        />
                        <DropdownMenu.Item
                          className="gap-x-2"
                          onClick={() => deleteRow(index)}
                          data-testid={`metadata-form-row-${index}-action-delete`}
                        >
                          <Trash className="text-ui-fg-subtle" />
                          {t('metadata.edit.actions.deleteRow')}
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </div>
                </ConditionalTooltip>
              );
            })}
          </div>
          {hasUneditableRows && (
            <InlineTip
              variant="warning"
              label={t('metadata.edit.complexRow.label')}
              data-testid="metadata-form-warning-tip"
            >
              {t('metadata.edit.complexRow.description')}
            </InlineTip>
          )}
        </RouteDrawer.Body>
        <RouteDrawer.Footer data-testid="metadata-form-footer">
          <div
            className="flex items-center justify-end gap-x-2"
            data-testid="metadata-form-footer-actions"
          >
            <RouteDrawer.Close
              asChild
              data-testid="metadata-form-cancel-button-wrapper"
            >
              <Button
                size="small"
                variant="secondary"
                type="button"
                disabled={isMutating}
                data-testid="metadata-form-cancel-button"
              >
                {t('actions.cancel')}
              </Button>
            </RouteDrawer.Close>
            <Button
              size="small"
              type="submit"
              isLoading={isMutating}
              data-testid="metadata-form-save-button"
            >
              {t('actions.save')}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  );
};

const GridInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        autoComplete="off"
        className={clx(
          'txt-compact-small bg-transparent px-2 py-1.5 text-ui-fg-base outline-none placeholder:text-ui-fg-muted disabled:bg-ui-bg-base disabled:text-ui-fg-disabled',
          className
        )}
      />
    );
  }
);
GridInput.displayName = 'MetadataForm.GridInput';

const PlaceholderInner = () => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <RouteDrawer.Body>
        <Skeleton className="h-[148ox] w-full rounded-lg" />
      </RouteDrawer.Body>
      <RouteDrawer.Footer>
        <div className="flex items-center justify-end gap-x-2">
          <Skeleton className="h-7 w-12 rounded-md" />
          <Skeleton className="h-7 w-12 rounded-md" />
        </div>
      </RouteDrawer.Footer>
    </div>
  );
};

const EDITABLE_TYPES = ['string', 'number', 'boolean'];

function getDefaultValues(
  metadata?: Record<string, unknown> | null
): z.infer<typeof MetadataFieldSchema>[] {
  if (!metadata || !Object.keys(metadata).length) {
    return [
      {
        key: '',
        value: '',
        disabled: false
      }
    ];
  }

  return Object.entries(metadata).map(([key, value]) => {
    if (!EDITABLE_TYPES.includes(typeof value)) {
      return {
        key,
        value: value,
        disabled: true
      };
    }

    let stringValue = value;

    if (typeof value !== 'string') {
      stringValue = JSON.stringify(value);
    }

    return {
      key,
      value: stringValue,
      original_key: key
    };
  });
}

function parseValues(
  values: z.infer<typeof MetadataSchema>,
  _original?: Record<string, unknown> | null
): Record<string, unknown> | null {
  const metadata = values.metadata;

  const isEmpty =
    !metadata.length || (metadata.length === 1 && !metadata[0].key && !metadata[0].value);

  if (isEmpty) {
    return null;
  }

  const update: Record<string, unknown> = {};

  // Build payload from current form rows only - removed keys are omitted entirely
  metadata.forEach(field => {
    let key = field.key;
    let value = field.value;
    const disabled = field.disabled;

    if (!key) {
      return;
    }

    if (disabled) {
      update[key] = value;

      return;
    }

    key = key.trim();
    value = value?.trim() ?? '';

    // We try to cast the value to a boolean or number if possible
    if (value === 'true') {
      update[key] = true;
    } else if (value === 'false') {
      update[key] = false;
    } else {
      const isNumeric = /^-?\d*\.?\d+$/.test(value);
      if (isNumeric) {
        update[key] = parseFloat(value);
      } else {
        update[key] = value;
      }
    }
  });

  return update;
}

function getHasUneditableRows(metadata?: Record<string, unknown> | null) {
  if (!metadata) {
    return false;
  }

  return Object.values(metadata).some(value => !EDITABLE_TYPES.includes(typeof value));
}
