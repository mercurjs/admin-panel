import { useEffect, useMemo, useState } from 'react';

import { ExtendedAdminOrder, ManagedBy } from '@custom-types/order';
import { zodResolver } from '@hookform/resolvers/zod';
import { InventoryItemDTO, OrderLineItemDTO } from '@medusajs/types';
import { Alert, Button, Heading, toast } from '@medusajs/ui';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';

import { NoRecords } from '../../../../../components/common/empty-table-content';
import { Form } from '../../../../../components/common/form';
import { Combobox } from '../../../../../components/inputs/combobox';
import { RouteFocusModal, useRouteModal } from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import { ordersQueryKeys } from '../../../../../hooks/api/orders';
import { useCreateReservationItem } from '../../../../../hooks/api/reservations';
import { useComboboxData } from '../../../../../hooks/use-combobox-data';
import { sdk } from '../../../../../lib/client';
import { getFulfillableQuantity } from '../../../../../lib/order-item';
import { queryClient } from '../../../../../lib/query-client';
import { AllocateItemsSchema } from './constants';
import { OrderAllocateItemsItem } from './order-allocate-items-item';
import { checkInventoryKit } from './utils';

type OrderAllocateItemsFormProps = {
  order: ExtendedAdminOrder;
};

export function OrderAllocateItemsForm({ order }: OrderAllocateItemsFormProps) {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const [disableSubmit, setDisableSubmit] = useState(false);

  const { mutateAsync: allocateItems, isPending: isMutating } = useCreateReservationItem();

  const stockLocations = useComboboxData({
    queryFn: params => sdk.admin.stockLocation.list(params),
    queryKey: ['stock_locations'],
    getOptions: data =>
      data.stock_locations.map(location => ({
        label: location.name,
        value: location.id
      }))
  });

  const adminLocationIds = useMemo(() => {
    return new Set(stockLocations.options.map(opt => opt.value));
  }, [stockLocations.options]);

  const [allocatableItems, setAllocatableItems] = useState(() => {
    const itemsWithQuantity = (order.items || []).filter(
      item =>
        item.variant?.manage_inventory &&
        item.variant?.inventory?.length &&
        getFulfillableQuantity(item) > 0
    );
    return itemsWithQuantity;
  });

  const form = useForm<zod.infer<typeof AllocateItemsSchema>>({
    defaultValues: {
      quantity: defaultAllocations(allocatableItems),
      selected_items: allocatableItems.map(item => item.id),
      location_id: ''
    },
    resolver: zodResolver(AllocateItemsSchema)
  });

  const selectedLocationId = useWatch({
    name: 'location_id',
    control: form.control
  });

  const handleSubmit = form.handleSubmit(async data => {
    if (!selectedLocationId) {
      form.setError('location_id', {
        type: 'manual',
        message: t('orders.allocateItems.error.noLocation')
      });
      return;
    }

    try {
      const payload = Object.entries(data.quantity)
        .filter(([key]) => !key.endsWith('-'))
        .filter(([key]) => {
          const itemId = key.split('-')[0];
          return data.selected_items.includes(itemId);
        })
        .map(([key, quantity]) => [...key.split('-'), quantity]);

      if (payload.some(d => d[2] === '')) {
        form.setError('root.quantityNotAllocated', {
          type: 'manual',
          message: t('orders.allocateItems.error.quantityNotAllocated')
        });

        return;
      }

      const promises = payload.map(([itemId, inventoryId, quantity]) =>
        allocateItems({
          location_id: selectedLocationId,
          inventory_item_id: inventoryId as string,
          line_item_id: itemId as string,
          quantity: Number(quantity)
        })
          .then(() => ({ success: true, inventory_item_id: inventoryId }))
          .catch(() => ({ success: false, inventory_item_id: inventoryId }))
      );

      /**
       * TODO: we should have bulk endpoint for this so this is executed in a workflow and can be reverted
       */
      const results = await Promise.all(promises);

      // invalidate order details so we get new item.variant.inventory items
      await queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });

      toast.success(t('orders.allocateItems.toast.created'));
      handleSuccess(`/orders/${order.id}`);

      if (results.some(r => !r.success)) {
        const failedItems = results
          .filter(r => !r.success)
          .map(r => r.inventory_item_id)
          .join(', ');

        toast.error(t('general.error'), {
          description: t('orders.allocateItems.toast.error', {
            items: failedItems
          }),
          dismissLabel: t('actions.close')
        });
      }
    } catch (e) {
      toast.error(e.message);
    }
  });

  const onQuantityChange = (
    inventoryItem: InventoryItemDTO,
    lineItem: OrderLineItemDTO,
    hasInventoryKit: boolean,
    value: number | null,
    isRoot?: boolean
  ) => {
    let shouldDisableSubmit = false;

    const key =
      isRoot && hasInventoryKit
        ? `quantity.${lineItem.id}-`
        : `quantity.${lineItem.id}-${inventoryItem.id}`;

    form.setValue(key, value);

    if (value) {
      const location = inventoryItem.location_levels?.find(
        l => l.location_id === selectedLocationId
      );
      if (location) {
        if (location.available_quantity < value) {
          shouldDisableSubmit = true;
        }
      }
    }

    if (hasInventoryKit && !isRoot) {
      // changed subitem in the kit -> we need to set parent to "-"
      form.resetField(`quantity.${lineItem.id}-`, { defaultValue: '' });
    }

    if (hasInventoryKit && isRoot) {
      // changed root -> we need to set items to parent quantity x required_quantity

      const item = allocatableItems.find(i => i.id === lineItem.id);

      item.variant?.inventory_items?.forEach((ii, ind) => {
        const num = value || 0;
        const inventory = item.variant?.inventory[ind];

        form.setValue(`quantity.${lineItem.id}-${inventory.id}`, num * ii.required_quantity);

        if (value) {
          const location = inventory?.location_levels?.find(
            l => l.location_id === selectedLocationId
          );
          if (location) {
            if (location.available_quantity < value) {
              shouldDisableSubmit = true;
            }
          }
        }
      });
    }

    form.clearErrors('root.quantityNotAllocated');
    setDisableSubmit(shouldDisableSubmit);
  };

  useEffect(() => {
    if (selectedLocationId) {
      form.setValue('quantity', defaultAllocations(allocatableItems));
    }
  }, [selectedLocationId]);

  const showLevelsWarning = useMemo(() => {
    if (!selectedLocationId) {
      return false;
    }

    const allItemsHaveLocation = allocatableItems
      .map(item => {
        if (!item.variant_id) {
          return true;
        }

        if (!item.variant?.manage_inventory) {
          return true;
        }

        const inventory = item.variant?.inventory?.[0];
        const locationLevels = inventory?.location_levels;

        return locationLevels?.find((l: any) => l.location_id === selectedLocationId);
      })
      .every(Boolean);

    return !allItemsHaveLocation;
  }, [allocatableItems, selectedLocationId]);

  const hasNoAllocatableItems = useMemo(() => {
    return allocatableItems.every(
      item =>
        item.variant?.managed_by !== ManagedBy.ADMIN && item.variant?.managed_by !== ManagedBy.BOTH
    );
  }, [allocatableItems]);

  return (
    <RouteFocusModal.Form
      form={form}
      data-testid="order-allocate-items-form"
    >
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex h-full flex-col"
      >
        <RouteFocusModal.Header data-testid="order-allocate-items-header" />

        <RouteFocusModal.Body
          className="flex size-full justify-center overflow-y-auto"
          data-testid="order-allocate-items-body"
        >
          <div
            className="flex size-full w-[752px] max-w-[100%] flex-col gap-8 px-4 pt-16"
            data-testid="order-allocate-items-form-content"
          >
            <Heading level="h2">{t('orders.allocateItems.title')}</Heading>
            {hasNoAllocatableItems ? (
              <NoRecords
                icon={null}
                title={t('orders.allocateItems.error.allocationNotAvailable')}
                message={t('orders.allocateItems.error.allocationNotAvailableDescription')}
                className="py-8 text-center"
                data-testid="order-allocate-items-no-items"
              />
            ) : (
              <div className="flex w-full flex-col justify-center">
                <div className="flex flex-col divide-y divide-dashed">
                  <div
                    className="pb-8"
                    data-testid="order-allocate-items-location-section"
                  >
                    <Form.Field
                      control={form.control}
                      name="location_id"
                      render={({ field: { ...field } }) => {
                        return (
                          <Form.Item data-testid="order-allocate-items-location-item">
                            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                              <div className="flex-1">
                                <Form.Label data-testid="order-allocate-items-location-label">
                                  {t('fields.location')}
                                </Form.Label>
                                <Form.Hint data-testid="order-allocate-items-location-hint">
                                  {t('orders.allocateItems.locationDescription')}
                                </Form.Hint>
                              </div>
                              <div className="flex-1">
                                <Form.Control data-testid="order-allocate-items-location-control">
                                  <Combobox
                                    {...field}
                                    options={stockLocations.options}
                                    searchValue={stockLocations.searchValue}
                                    onSearchValueChange={stockLocations.onSearchValueChange}
                                    disabled={stockLocations.disabled}
                                    data-testid="order-allocate-items-location-combobox"
                                  />
                                </Form.Control>
                              </div>
                            </div>
                            <Form.ErrorMessage data-testid="order-allocate-items-location-error" />
                          </Form.Item>
                        );
                      }}
                    />
                    {showLevelsWarning && (
                      <Alert
                        variant="warning"
                        dismissible
                        className="mt-4 p-3"
                      >
                        <span className="-mt-[3px] block font-medium">
                          {t('orders.returns.noInventoryLevel')}
                        </span>
                        <span className="text-ui-fg-muted">
                          {t('orders.returns.noInventoryLevelDesc')}
                        </span>
                      </Alert>
                    )}
                  </div>

                  <div data-testid="order-allocate-items-items-section">
                    <Form.Item
                      className="mt-8 space-y-3"
                      data-testid="order-allocate-items-items-item"
                    >
                      <div>
                        <Form.Label data-testid="order-allocate-items-items-label">
                          {t('orders.allocateItems.itemsToAllocate')}
                        </Form.Label>
                        <Form.Hint data-testid="order-allocate-items-items-hint">
                          {t('orders.allocateItems.itemsToAllocateDesc')}
                        </Form.Hint>
                      </div>

                      <div
                        className="flex flex-col gap-y-2"
                        data-testid="order-allocate-items-items-list"
                      >
                        {allocatableItems.map(item => {
                          const managedByAdmin =
                            item.variant?.managed_by === ManagedBy.ADMIN ||
                            item.variant?.managed_by === ManagedBy.BOTH;

                          return (
                            <OrderAllocateItemsItem
                              key={item.id}
                              form={form}
                              item={item}
                              locationId={selectedLocationId}
                              onQuantityChange={onQuantityChange}
                              disabled={showLevelsWarning || !managedByAdmin}
                              managedByAdmin={managedByAdmin}
                            />
                          );
                        })}
                      </div>
                    </Form.Item>
                    {form.formState.errors.root && (
                      <Alert
                        variant="error"
                        dismissible={false}
                        className="flex items-center"
                        data-testid="order-allocate-items-items-error"
                      >
                        {form.formState.errors.root?.message}
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="py-4" />
          </div>
        </RouteFocusModal.Body>
        {!hasNoAllocatableItems && (
          <RouteFocusModal.Footer data-testid="order-allocate-items-footer">
            <div
              className="flex items-center justify-end gap-x-2"
              data-testid="order-allocate-items-form-footer-actions"
            >
              <RouteFocusModal.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  data-testid="order-allocate-items-cancel-button"
                >
                  {t('actions.cancel')}
                </Button>
              </RouteFocusModal.Close>
              <Button
                size="small"
                type="submit"
                isLoading={isMutating}
                disabled={!selectedLocationId || disableSubmit}
                data-testid="order-allocate-items-submit-button"
              >
                {t('orders.allocateItems.action')}
              </Button>
            </div>
          </RouteFocusModal.Footer>
        )}
      </KeyboundForm>
    </RouteFocusModal.Form>
  );
}

function defaultAllocations(items: OrderLineItemDTO[]) {
  const ret = {};

  items.forEach(item => {
    const hasInventoryKit = checkInventoryKit(item);

    ret[hasInventoryKit ? `${item.id}-` : `${item.id}-${item.variant?.inventory[0].id}`] = '';

    if (hasInventoryKit) {
      item.variant?.inventory?.forEach(i => {
        ret[`${item.id}-${i.id}`] = '';
      });
    }
  });

  return ret;
}
