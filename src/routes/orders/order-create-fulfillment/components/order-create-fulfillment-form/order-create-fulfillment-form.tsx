import { useEffect, useMemo, useState } from 'react';

import { ExtendedAdminOrder, ManagedBy } from '@custom-types/order';
import { zodResolver } from '@hookform/resolvers/zod';
import { HttpTypes, OrderLineItemDTO } from '@medusajs/types';
import { Alert, Button, Heading, Select, Switch, Text, toast } from '@medusajs/ui';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';

import { NoRecords } from '../../../../../components/common/empty-table-content';
import { Form } from '../../../../../components/common/form';
import { Combobox } from '../../../../../components/inputs/combobox';
import { RouteFocusModal, useRouteModal } from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import { useReservationItems, useShippingOptions } from '../../../../../hooks/api';
import { useCreateOrderFulfillment } from '../../../../../hooks/api/orders';
import { useComboboxData } from '../../../../../hooks/use-combobox-data';
import { useDocumentDirection } from '../../../../../hooks/use-document-direction';
import { sdk } from '../../../../../lib/client';
import { getFulfillableQuantity } from '../../../../../lib/order-item';
import { getReservationsLimitCount } from '../../../../../lib/orders';
import { CreateFulfillmentSchema } from './constants';
import { OrderCreateFulfillmentItem } from './order-create-fulfillment-item';

type OrderCreateFulfillmentFormProps = {
  order: ExtendedAdminOrder;
  requiresShipping: boolean;
};

export function OrderCreateFulfillmentForm({
  order,
  requiresShipping
}: OrderCreateFulfillmentFormProps) {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const direction = useDocumentDirection();
  const { mutateAsync: createOrderFulfillment, isPending: isMutating } = useCreateOrderFulfillment(
    order.id
  );

  const { reservations } = useReservationItems({
    line_item_id: order.items.map(i => i.id),
    limit: getReservationsLimitCount(order)
  });

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

  const [fulfillableItems, setFulfillableItems] = useState(() => {
    const itemsWithQuantity = (order.items || []).filter(
      item => item.requires_shipping === requiresShipping && getFulfillableQuantity(item) > 0
    );
    return itemsWithQuantity;
  });

  const form = useForm<zod.infer<typeof CreateFulfillmentSchema>>({
    defaultValues: {
      quantity: fulfillableItems.reduce(
        (acc, item) => {
          acc[item.id] = getFulfillableQuantity(item);
          return acc;
        },
        {} as Record<string, number>
      ),
      selected_items: fulfillableItems.map(item => item.id),
      send_notification: !order.no_notification
    },
    resolver: zodResolver(CreateFulfillmentSchema)
  });

  const selectedLocationId = useWatch({
    name: 'location_id',
    control: form.control
  });

  const { shipping_options = [], isLoading: isShippingOptionsLoading } = useShippingOptions({
    stock_location_id: selectedLocationId,
    // is_return: false, // TODO: 500 when enabled
    fields: '+service_zone.fulfillment_set.location.id'
  });

  const shippingOptionId = useWatch({
    name: 'shipping_option_id',
    control: form.control
  });

  const handleSubmit = form.handleSubmit(async data => {
    const selectedShippingOption = shipping_options.find(o => o.id === shippingOptionId);

    if (!selectedShippingOption) {
      form.setError('shipping_option_id', {
        type: 'manual',
        message: t('orders.fulfillment.error.noShippingOption')
      });
      return;
    }

    if (!selectedLocationId) {
      form.setError('location_id', {
        type: 'manual',
        message: t('orders.fulfillment.error.noLocation')
      });
      return;
    }

    let items = Object.entries(data.quantity)
      .map(([id, quantity]) => ({
        id,
        quantity
      }))
      .filter(({ quantity, id }) => !!quantity && data.selected_items.includes(id));

    /**
     * If items require shipping fulfill only items with matching shipping profile.
     */
    if (requiresShipping) {
      const selectedShippingProfileId = selectedShippingOption?.shipping_profile_id;

      const itemShippingProfileMap = order.items.reduce((acc, item) => {
        acc[item.id] = item.variant?.product?.shipping_profile?.id;
        return acc;
      }, {} as any);

      items = items.filter(({ id }) => itemShippingProfileMap[id] === selectedShippingProfileId);
    }

    if (items.length === 0) {
      toast.error(t('orders.fulfillment.error.fulfillmentNotAvailable'));
      return;
    }

    const payload: HttpTypes.AdminCreateOrderFulfillment = {
      location_id: selectedLocationId,
      shipping_option_id: shippingOptionId,
      no_notification: !data.send_notification,
      items
    };

    try {
      await createOrderFulfillment(payload);

      toast.success(t('orders.fulfillment.toast.created'));
      handleSuccess(`/orders/${order.id}`);
    } catch (e) {
      toast.error(e.message);
    }
  });

  useEffect(() => {
    if (shipping_options?.length) {
      const initialShippingOptionId = order.shipping_methods?.[0]?.shipping_option_id;

      if (initialShippingOptionId) {
        const shippingOption = shipping_options.find(o => o.id === initialShippingOptionId);

        if (shippingOption) {
          const locationId = shippingOption.service_zone.fulfillment_set.location.id;

          form.setValue('location_id', locationId);
          form.setValue('shipping_option_id', initialShippingOptionId || undefined);
        } // else -> TODO: what if original shipping option is deleted?
      }
    }
  }, [shipping_options]);

  const adminLocationIdsKey = useMemo(
    () => Array.from(adminLocationIds).sort().join(','),
    [adminLocationIds]
  );

  const fulfilledQuantitiesKey = useMemo(
    () =>
      (order.items || [])
        .filter(item => item.requires_shipping === requiresShipping)
        .map(item => `${item.id}:${item.detail.fulfilled_quantity}`)
        .sort()
        .join(','),
    [order.items, requiresShipping]
  );

  useEffect(() => {
    const itemsWithQuantity =
      order?.items?.filter(
        item => item.requires_shipping === requiresShipping && getFulfillableQuantity(item) > 0
      ) || [];

    setFulfillableItems(itemsWithQuantity);

    if (itemsWithQuantity.length) {
      form.clearErrors('root');
    } else {
      form.setError('root', {
        type: 'manual',
        message: t('orders.fulfillment.error.fulfillmentNotAvailable')
      });
    }

    const quantityMap = itemsWithQuantity.reduce(
      (acc, item) => {
        acc[item.id] = getFulfillableQuantity(item as OrderLineItemDTO);
        return acc;
      },
      {} as Record<string, number>
    );

    form.setValue('quantity', quantityMap);
  }, [fulfilledQuantitiesKey, requiresShipping, adminLocationIdsKey]);

  const differentOptionSelected =
    shippingOptionId && order.shipping_methods?.[0]?.shipping_option_id !== shippingOptionId;

  const showLevelsWarning = useMemo(() => {
    if (!selectedLocationId) {
      return false;
    }

    const allItemsHaveLocation = fulfillableItems
      .map(item => {
        if (!item.variant_id) {
          return true;
        }

        if (!item.variant?.manage_inventory) {
          return true;
        }

        const inventory = (item.variant as any)?.inventory?.[0];
        const locationLevels = inventory?.location_levels;

        return locationLevels?.find((l: any) => l.location_id === selectedLocationId);
      })
      .every(Boolean);

    return !allItemsHaveLocation;
  }, [fulfillableItems, selectedLocationId]);

  const hasNoFulfillableItems = useMemo(() => {
    return fulfillableItems.every(
      item =>
        item.variant?.managed_by !== ManagedBy.ADMIN && item.variant?.managed_by !== ManagedBy.BOTH
    );
  }, [fulfillableItems]);

  return (
    <RouteFocusModal.Form
      form={form}
      data-testid="order-create-fulfillment-form"
    >
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex h-full flex-col"
        data-testid="order-create-fulfillment-form"
      >
        <RouteFocusModal.Header data-testid="order-create-fulfillment-header" />

        <RouteFocusModal.Body
          className="flex size-full justify-center overflow-y-auto"
          data-testid="order-create-fulfillment-body"
        >
          <div
            className="flex size-full w-[752px] max-w-[100%] flex-col gap-8 px-4 pt-16"
            data-testid="order-create-fulfillment-form-content"
          >
            <Heading level="h2">{t('orders.fulfillment.create')}</Heading>
            {hasNoFulfillableItems ? (
              <NoRecords
                showIcon={false}
                title={t('orders.fulfillment.error.fulfillmentNotAvailable')}
                message={t('orders.fulfillment.error.fulfillmentNotAvailableDescription')}
                className="py-8 text-center"
                data-testid="order-create-fulfillment-no-items"
              />
            ) : (
              <div className="flex w-full flex-col justify-center">
                <div className="flex flex-col divide-y divide-dashed">
                  <div
                    className="pb-8"
                    data-testid="order-create-fulfillment-location-section"
                  >
                    <Form.Field
                      control={form.control}
                      name="location_id"
                      render={({ field: { ...field } }) => {
                        return (
                          <Form.Item data-testid="order-create-fulfillment-location-item">
                            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                              <div className="flex-1">
                                <Form.Label data-testid="order-create-fulfillment-location-label">
                                  {t('fields.location')}
                                </Form.Label>
                                <Form.Hint data-testid="order-create-fulfillment-location-hint">
                                  {t('orders.fulfillment.locationDescription')}
                                </Form.Hint>
                              </div>
                              <div className="flex-1">
                                <Form.Control data-testid="order-create-fulfillment-location-control">
                                  <Combobox
                                    {...field}
                                    options={stockLocations.options}
                                    searchValue={stockLocations.searchValue}
                                    onSearchValueChange={stockLocations.onSearchValueChange}
                                    disabled={stockLocations.disabled}
                                    data-testid="order-create-fulfillment-location-combobox"
                                  />
                                </Form.Control>
                              </div>
                            </div>
                            <Form.ErrorMessage data-testid="order-create-fulfillment-location-error" />
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
                        <Text
                          weight="plus"
                          leading="compact"
                          className="mb-1 text-ui-fg-base"
                          size="small"
                        >
                          {t('orders.returns.noInventoryLevel')}
                        </Text>
                        <Text
                          leading="normal"
                          className="text-ui-fg-subtle"
                          size="small"
                        >
                          {t('orders.returns.noInventoryLevelDesc')}
                        </Text>
                      </Alert>
                    )}
                  </div>

                  <div
                    className="py-8"
                    data-testid="order-create-fulfillment-shipping-section"
                  >
                    <Form.Field
                      control={form.control}
                      name="shipping_option_id"
                      render={({ field: { onChange, ref, ...field } }) => {
                        return (
                          <Form.Item data-testid="order-create-fulfillment-shipping-item">
                            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                              <div className="flex-1">
                                <Form.Label data-testid="order-create-fulfillment-shipping-label">
                                  {t('fields.shippingMethod')}
                                </Form.Label>
                                <Form.Hint data-testid="order-create-fulfillment-shipping-hint">
                                  {t('orders.fulfillment.methodDescription')}
                                </Form.Hint>
                              </div>
                              <div className="flex-1">
                                <Form.Control data-testid="order-create-fulfillment-shipping-control">
                                  <Select
                                    dir={direction}
                                    onValueChange={onChange}
                                    {...field}
                                    disabled={!selectedLocationId}
                                    data-testid="order-create-fulfillment-shipping-select"
                                  >
                                    <Select.Trigger
                                      className="bg-ui-bg-base"
                                      ref={ref}
                                      data-testid="order-create-fulfillment-shipping-trigger"
                                    >
                                      {isShippingOptionsLoading ? (
                                        <span
                                          className="text-right"
                                          data-testid="order-create-fulfillment-form-shipping-select-loading"
                                        >
                                          {t('labels.loading')}...
                                        </span>
                                      ) : (
                                        <Select.Value data-testid="order-create-fulfillment-form-shipping-select-value" />
                                      )}
                                    </Select.Trigger>
                                    <Select.Content data-testid="order-create-fulfillment-shipping-content">
                                      {shipping_options.map(o => (
                                        <Select.Item
                                          key={o.id}
                                          value={o.id}
                                          data-testid={`order-create-fulfillment-shipping-option-${o.id}`}
                                        >
                                          {o.name}
                                        </Select.Item>
                                      ))}
                                    </Select.Content>
                                  </Select>
                                </Form.Control>
                              </div>
                            </div>
                            <Form.ErrorMessage data-testid="order-create-fulfillment-shipping-error" />
                          </Form.Item>
                        );
                      }}
                    />

                    {differentOptionSelected && (
                      <Alert
                        className="mt-4 border-none p-3 shadow-elevation-card-rest"
                        variant="warning"
                        dismissible
                        data-testid="order-create-fulfillment-shipping-warning"
                      >
                        <span
                          className="-mt-[3px] block font-medium"
                          data-testid="order-create-fulfillment-form-shipping-warning-title"
                        >
                          {t('labels.beaware')}
                        </span>
                        <span
                          className="text-ui-fg-muted"
                          data-testid="order-create-fulfillment-form-shipping-warning-message"
                        >
                          {t('orders.fulfillment.differentOptionSelected')}
                        </span>
                      </Alert>
                    )}
                  </div>
                  <div data-testid="order-create-fulfillment-items-section">
                    <Form.Item
                      className="mt-8 space-y-3"
                      data-testid="order-create-fulfillment-items-item"
                    >
                      <div>
                        <Form.Label data-testid="order-create-fulfillment-items-label">
                          {t('orders.fulfillment.itemsToFulfill')}
                        </Form.Label>
                        <Form.Hint data-testid="order-create-fulfillment-items-hint">
                          {t('orders.fulfillment.itemsToFulfillDesc')}
                        </Form.Hint>
                      </div>

                      <div
                        className="flex flex-col gap-y-2"
                        data-testid="order-create-fulfillment-items-list"
                      >
                        {fulfillableItems.map(item => {
                          const isShippingProfileMatching =
                            shipping_options.find(o => o.id === shippingOptionId)
                              ?.shipping_profile_id === item.variant?.product?.shipping_profile?.id;

                          const managedByAdmin =
                            item.variant?.managed_by === ManagedBy.ADMIN ||
                            item.variant?.managed_by === ManagedBy.BOTH;

                          return (
                            <OrderCreateFulfillmentItem
                              key={item.id}
                              form={form}
                              item={item}
                              locationId={selectedLocationId}
                              disabled={
                                (requiresShipping && !isShippingProfileMatching) ||
                                showLevelsWarning ||
                                !managedByAdmin
                              }
                              reservations={reservations}
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
                        data-testid="order-create-fulfillment-items-error"
                      >
                        {form.formState.errors.root?.message}
                      </Alert>
                    )}
                  </div>

                  <div
                    className="mt-8 pt-8"
                    data-testid="order-create-fulfillment-notification-section"
                  >
                    <Form.Field
                      control={form.control}
                      name="send_notification"
                      render={({ field: { onChange, value, ...field } }) => {
                        return (
                          <Form.Item data-testid="order-create-fulfillment-notification-item">
                            <div
                              className="flex gap-x-3 rounded-lg bg-ui-bg-component p-3 shadow-elevation-card-rest"
                              data-testid="order-create-fulfillment-form-notification-control"
                            >
                              <Form.Control data-testid="order-create-fulfillment-notification-control">
                                <Form.Control>
                                  <Switch
                                    dir="ltr"
                                    className="rtl:rotate-180"
                                    checked={!!value}
                                    onCheckedChange={onChange}
                                    {...field}
                                    data-testid="order-create-fulfillment-notification-switch"
                                  />
                                </Form.Control>
                              </Form.Control>
                              <div>
                                <Form.Label data-testid="order-create-fulfillment-notification-label">
                                  {t('orders.returns.sendNotification')}
                                </Form.Label>
                                <Form.Hint
                                  className="!mt-1 text-ui-fg-subtle"
                                  data-testid="order-create-fulfillment-notification-hint"
                                >
                                  {t('orders.fulfillment.sendNotificationHint')}
                                </Form.Hint>
                              </div>
                            </div>
                            <Form.ErrorMessage data-testid="order-create-fulfillment-notification-error" />
                          </Form.Item>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="py-4" />
          </div>
        </RouteFocusModal.Body>
        {!hasNoFulfillableItems && (
          <RouteFocusModal.Footer data-testid="order-create-fulfillment-footer">
            <div
              className="flex items-center justify-end gap-x-2"
              data-testid="order-create-fulfillment-form-footer-actions"
            >
              <RouteFocusModal.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  data-testid="order-create-fulfillment-cancel-button"
                >
                  {t('actions.cancel')}
                </Button>
              </RouteFocusModal.Close>
              <Button
                size="small"
                type="submit"
                isLoading={isMutating}
                disabled={!shippingOptionId}
                data-testid="order-create-fulfillment-create-button"
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
