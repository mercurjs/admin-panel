import { useEffect, useMemo, useState } from 'react';

import {
  ManagedBy,
  type ExtendedAdminOrder,
  type ExtendedAdminOrderLineItem,
  type ExtendedInventoryItemDTO
} from '@custom-types/order';
import { zodResolver } from '@hookform/resolvers/zod';
import { MagnifyingGlass } from '@medusajs/icons';
import { Alert, Button, Heading, Input, Text, toast } from '@medusajs/ui';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type * as zod from 'zod';

import { NoRecords } from '../../../../../components/common/empty-table-content';
import { Form } from '../../../../../components/common/form';
import { Combobox } from '../../../../../components/inputs/combobox';
import { RouteFocusModal, useRouteModal } from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import { ordersQueryKeys } from '../../../../../hooks/api/orders';
import { useBatchReservationItems } from '../../../../../hooks/api/reservations';
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
  const [filterTerm, setFilterTerm] = useState('');

  const { mutateAsync: batchAllocateItems, isPending: isMutating } = useBatchReservationItems();

  const stockLocations = useComboboxData({
    queryFn: params => sdk.admin.stockLocation.list(params),
    queryKey: ['stock_locations'],
    getOptions: data =>
      data.stock_locations.map(location => ({
        label: location.name,
        value: location.id
      }))
  });

  const allocatableItems = useMemo(() => {
    const itemsWithQuantity = (order.items || []).filter(
      item =>
        item.variant?.manage_inventory &&
        item.variant?.inventory?.length &&
        getFulfillableQuantity(item) > 0
    );

    return itemsWithQuantity;
  }, [order.items]);

  const filteredItems = useMemo(() => {
    if (!filterTerm) {
      return allocatableItems;
    }

    return allocatableItems.filter(
      i =>
        i.variant_title?.toLowerCase().includes(filterTerm.toLowerCase()) ||
        i.product_title?.toLowerCase().includes(filterTerm.toLowerCase()) ||
        i.title?.toLowerCase().includes(filterTerm.toLowerCase()) ||
        i.variant_sku?.toLowerCase().includes(filterTerm.toLowerCase())
    );
  }, [allocatableItems, filterTerm]);

  const form = useForm<zod.infer<typeof AllocateItemsSchema>>({
    defaultValues: {
      quantity: defaultAllocations(allocatableItems),
      selected_items: allocatableItems
        .filter(
          item =>
            item.variant?.managed_by === ManagedBy.ADMIN ||
            item.variant?.managed_by === ManagedBy.BOTH
        )
        .map(item => item.id),
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
      toast.error(t('orders.allocateItems.error.noLocation'));

      return;
    }

    if (data.selected_items.length === 0) {
      toast.error(t('orders.allocateItems.error.noItemsSelected'));

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
        toast.error(t('orders.allocateItems.error.quantityNotAllocated'));

        return;
      }

      const createPayload = payload.map(([itemId, inventoryId, quantity]) => ({
        location_id: selectedLocationId,
        inventory_item_id: inventoryId as string,
        line_item_id: itemId as string,
        quantity: Number(quantity)
      }));

      await batchAllocateItems({ create: createPayload });

      // invalidate order details so we get new item.variant.inventory items
      await queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });

      toast.success(t('orders.allocateItems.toast.created'));
      handleSuccess(`/orders/${order.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'An error occurred');
    }
  });

  const onQuantityChange = (
    inventoryItem: ExtendedInventoryItemDTO,
    lineItem: ExtendedAdminOrderLineItem,
    hasInventoryKit: boolean,
    value: number | null,
    isRoot?: boolean
  ) => {
    let shouldDisableSubmit = false;

    const key =
      isRoot && hasInventoryKit
        ? `quantity.${lineItem.id}-`
        : `quantity.${lineItem.id}-${inventoryItem.id}`;

    // @ts-ignore - dynamic form field key
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

      item?.variant?.inventory_items?.forEach((ii, ind) => {
        const num = value || 0;
        const inventory = item?.variant?.inventory?.[ind];

        if (inventory) {
          // @ts-ignore - dynamic form field key
          form.setValue(
            `quantity.${lineItem.id}-${inventory.id}`,
            num * (ii.required_quantity || 1)
          );

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
        }
      });
    }

    form.clearErrors('root.quantityNotAllocated');
    setDisableSubmit(shouldDisableSubmit);
  };

  useEffect(() => {
    if (selectedLocationId) {
      form.setValue('quantity', defaultAllocations(allocatableItems));
      form.setValue(
        'selected_items',
        allocatableItems
          .filter(
            item =>
              item.variant?.managed_by === ManagedBy.ADMIN ||
              item.variant?.managed_by === ManagedBy.BOTH
          )
          .map(item => item.id)
      );
    }
  }, [selectedLocationId, allocatableItems]);

  const selectedItems = useWatch({
    name: 'selected_items',
    control: form.control
  });

  const showLevelsWarning = useMemo(() => {
    if (!selectedLocationId) {
      return false;
    }

    const allItemsHaveLocation = allocatableItems
      .map(item => {
        if (!item.variant_id) {
          return true;
        }

        if (!selectedItems.includes(item.id)) {
          return true;
        }

        if (!item.variant?.manage_inventory) {
          return true;
        }

        const inventory = item.variant?.inventory?.[0];
        const locationLevels = inventory?.location_levels;

        return locationLevels?.find(l => l.location_id === selectedLocationId);
      })
      .every(Boolean);

    return !allItemsHaveLocation;
  }, [allocatableItems, selectedLocationId, selectedItems]);

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
                          {t('orders.allocateItems.noLevelsWarningDescription')}
                        </span>
                      </Alert>
                    )}
                  </div>

                  <div data-testid="order-allocate-items-items-section">
                    <Form.Item
                      className="mt-8 space-y-3"
                      data-testid="order-allocate-items-items-item"
                    >
                      <div className="flex flex-row items-center gap-x-4">
                        <div className="flex-1">
                          <Form.Label data-testid="order-allocate-items-items-label">
                            {t('orders.allocateItems.itemsToAllocate')}
                          </Form.Label>
                          <Form.Hint data-testid="order-allocate-items-items-hint">
                            {t('orders.allocateItems.itemsToAllocateDesc')}
                          </Form.Hint>
                        </div>
                        <div className="flex-1 sm:max-w-[200px]">
                          <Input
                            value={filterTerm}
                            onChange={e => setFilterTerm(e.target.value)}
                            placeholder={t('orders.allocateItems.search')}
                            autoComplete="off"
                            type="search"
                            data-testid="order-allocate-items-search-input"
                          />
                        </div>
                      </div>

                      {filteredItems.length === 0 && filterTerm ? (
                        <div className="flex flex-col items-center justify-center gap-y-2 rounded-xl bg-ui-bg-subtle p-3 text-center shadow-elevation-card-rest">
                          <MagnifyingGlass className="text-ui-fg-subtle" />
                          <Text
                            size="small"
                            leading="compact"
                            weight="plus"
                          >
                            {t('general.noSearchResults')}
                          </Text>
                        </div>
                      ) : (
                        <div
                          className="flex flex-col gap-y-2"
                          data-testid="order-allocate-items-items-list"
                        >
                          {filteredItems.map(item => {
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
                      )}
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
                {t('actions.confirm')}
              </Button>
            </div>
          </RouteFocusModal.Footer>
        )}
      </KeyboundForm>
    </RouteFocusModal.Form>
  );
}

function defaultAllocations(items: ExtendedAdminOrderLineItem[]) {
  const ret: Record<string, string | number> = {};

  items.forEach(item => {
    const hasInventoryKit = checkInventoryKit(item);

    const firstInventoryId = item.variant?.inventory?.[0]?.id;
    ret[hasInventoryKit ? `${item.id}-` : `${item.id}-${firstInventoryId}`] = '';

    if (hasInventoryKit) {
      item.variant?.inventory?.forEach(i => {
        ret[`${item.id}-${i.id}`] = '';
      });
    }
  });

  return ret;
}
