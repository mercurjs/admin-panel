import { useMemo, useState } from 'react';

import { Component, InformationCircleSolid, TriangleDownMini } from '@medusajs/icons';
import { InventoryItemDTO, OrderLineItemDTO } from '@medusajs/types';
import { Checkbox, CheckboxCheckedState, clx, Divider, Input, Text, Tooltip } from '@medusajs/ui';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';

import { Form } from '../../../../../components/common/form';
import { Thumbnail } from '../../../../../components/common/thumbnail';
import { getFulfillableQuantity } from '../../../../../lib/order-item';
import { AllocateItemsSchema } from './constants';
import { checkInventoryKit } from './utils';

type OrderAllocateItemsItemProps = {
  item: OrderLineItemDTO;
  locationId?: string;
  form: UseFormReturn<zod.infer<typeof AllocateItemsSchema>>;
  disabled: boolean;
  managedByAdmin: boolean;
  onQuantityChange: (
    inventoryItem: InventoryItemDTO,
    lineItem: OrderLineItemDTO,
    hasInventoryKit: boolean,
    value: number | null,
    isRoot?: boolean
  ) => void;
};

export function OrderAllocateItemsItem({
  item,
  form,
  locationId,
  disabled,
  managedByAdmin,
  onQuantityChange
}: OrderAllocateItemsItemProps) {
  const { t } = useTranslation();

  const variant = item.variant;
  const inventory = item.variant?.inventory || [];

  const [isOpen, setIsOpen] = useState(false);

  const quantityField = useWatch({
    control: form.control,
    name: 'quantity'
  });

  const watchedSelectedItems = useWatch({
    name: 'selected_items',
    control: form.control
  });

  const hasInventoryKit = checkInventoryKit(item);

  const { availableQuantity, inStockQuantity } = useMemo(() => {
    if (!variant || !locationId) {
      return {};
    }

    const locationInventory = inventory[0]?.location_levels?.find(
      inv => inv.location_id === locationId
    );

    if (!locationInventory) {
      return {};
    }

    return {
      availableQuantity: locationInventory.available_quantity,
      inStockQuantity: locationInventory.stocked_quantity
    };
  }, [variant, locationId]);

  const hasQuantityError =
    !hasInventoryKit &&
    availableQuantity &&
    quantityField[`${item.id}-${item.variant?.inventory[0].id}`] &&
    quantityField[`${item.id}-${item.variant?.inventory[0].id}`] > availableQuantity;

  const minValue = 0;
  const maxValue = Math.min(
    getFulfillableQuantity(item),
    availableQuantity || Number.MAX_SAFE_INTEGER
  );

  const handleSelectItem = (checked: CheckboxCheckedState, itemId: string) => {
    if (checked === true) {
      form.setValue('selected_items', [...watchedSelectedItems, itemId]);
    } else {
      form.setValue(
        'selected_items',
        watchedSelectedItems.filter(id => id !== itemId)
      );
    }
  };

  return (
    <div
      className="relative rounded-xl bg-ui-bg-component shadow-elevation-card-rest"
      data-testid={`order-allocate-items-item-${item.id}`}
    >
      <div
        className="flex flex-row items-center"
        data-testid={`order-allocate-items-item-${item.id}-content`}
      >
        <div className="ml-3 inline-flex items-center">
          {disabled ? (
            <Tooltip
              content={
                managedByAdmin
                  ? t('orders.allocateItems.disabledItemTooltip')
                  : t('orders.allocateItems.disabledItemTooltipManagedByVendor')
              }
              side="top"
              className="text-center"
            >
              <InformationCircleSolid
                className="text-ui-tag-orange-icon"
                data-testid={`order-allocate-items-item-${item.id}-disabled-indicator`}
              />
            </Tooltip>
          ) : (
            <Checkbox
              checked={watchedSelectedItems.includes(item.id)}
              onCheckedChange={checked => {
                handleSelectItem(checked, item.id);
              }}
              data-testid={`order-allocate-items-item-${item.id}-checkbox`}
            />
          )}
        </div>

        <div
          className={clx(
            'flex flex-1 flex-col gap-x-4 gap-y-2 py-2 pl-4 pr-3 text-sm sm:flex-row',
            disabled && 'pointer-events-none text-ui-fg-disabled'
          )}
          data-testid={`order-allocate-items-item-${item.id}-details`}
        >
          <div
            className="flex flex-1 items-center gap-x-4"
            data-testid={`order-allocate-items-item-${item.id}-info`}
          >
            <div className={clx(disabled && 'opacity-50')}>
              <Thumbnail
                src={item.thumbnail}
                data-testid={`order-allocate-items-item-${item.id}-thumbnail`}
              />
            </div>
            <div className="flex flex-col" data-testid={`order-allocate-items-item-${item.id}-text`}>
              <div data-testid={`order-allocate-items-item-${item.id}-title`}>
                <Text className="txt-small" as="span" weight="plus">
                  {item.title}
                </Text>{' '}
                {item.variant_sku && (
                  <span data-testid={`order-allocate-items-item-${item.id}-sku`}>
                    ({item.variant_sku})
                  </span>
                )}
                {hasInventoryKit && (
                  <Component
                    className="ml-2 overflow-visible pt-[2px] text-ui-fg-muted"
                    data-testid={`order-allocate-items-item-${item.id}-kit-icon`}
                  />
                )}
              </div>
              <Text
                as="div"
                className={clx('txt-small text-ui-fg-subtle', disabled && 'text-ui-fg-disabled')}
                data-testid={`order-allocate-items-item-${item.id}-variant-title`}
              >
                {item.variant_title}
              </Text>
            </div>
          </div>

          {!hasInventoryKit && (
            <div
              className="flex flex-1 items-center gap-x-4"
              data-testid={`order-allocate-items-item-${item.id}-quantities`}
            >
              <Divider orientation="vertical" className="h-4" />
              <div
                className="text-small flex flex-1 flex-col"
                data-testid={`order-allocate-items-item-${item.id}-available`}
              >
                <span
                  className="font-medium"
                  data-testid={`order-allocate-items-item-${item.id}-available-label`}
                >
                  {t('orders.allocateItems.available')}
                </span>
                <span
                  className={clx('text-ui-fg-subtle', disabled && 'text-ui-fg-disabled')}
                  data-testid={`order-allocate-items-item-${item.id}-available-value`}
                >
                  {availableQuantity || 'N/A'}
                  {availableQuantity &&
                    !hasInventoryKit &&
                    quantityField[`${item.id}-${item.variant?.inventory[0].id}`] && (
                      <span
                        className="txt-small ml-1 font-medium text-red-500"
                        data-testid={`order-allocate-items-item-${item.id}-available-reserved`}
                      >
                        -{quantityField[`${item.id}-${item.variant?.inventory[0].id}`]}
                      </span>
                    )}
                </span>
              </div>
              <Divider orientation="vertical" className="h-4" />
              <div
                className="flex flex-1 items-center gap-x-1"
                data-testid={`order-allocate-items-item-${item.id}-in-stock`}
              >
                <div className="flex flex-col">
                  <span
                    className="font-medium"
                    data-testid={`order-allocate-items-item-${item.id}-in-stock-label`}
                  >
                    {t('orders.allocateItems.inStock')}
                  </span>
                  <span
                    className={clx('text-ui-fg-subtle', disabled && 'text-ui-fg-disabled')}
                    data-testid={`order-allocate-items-item-${item.id}-in-stock-value`}
                  >
                    {inStockQuantity || 'N/A'}
                  </span>
                </div>
              </div>

              <div
                className="flex items-center gap-1"
                data-testid={`order-allocate-items-item-${item.id}-quantity-input-section`}
              >
                <Form.Field
                  control={form.control}
                  name={
                    hasInventoryKit
                      ? `quantity.${item.id}-`
                      : `quantity.${item.id}-${item.variant?.inventory[0].id}`
                  }
                  rules={{
                    required: !hasInventoryKit,
                    min: !hasInventoryKit && minValue,
                    max: maxValue
                  }}
                  render={({ field }) => {
                    return (
                      <Form.Item
                        className={clx(disabled && 'opacity-50')}
                        data-testid={`order-allocate-items-item-${item.id}-quantity-item`}
                      >
                        <Form.Control
                          data-testid={`order-allocate-items-item-${item.id}-quantity-control`}
                        >
                          <Input
                            className="txt-small w-[50px] rounded-lg bg-ui-bg-base text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            type="number"
                            {...field}
                            disabled={!locationId || disabled}
                            onChange={e => {
                              const val = e.target.value === '' ? null : Number(e.target.value);

                              onQuantityChange(
                                item.variant?.inventory[0],
                                item,
                                hasInventoryKit,
                                val,
                                true
                              );

                              if (!isNaN(val)) {
                                if (val < minValue || val > maxValue) {
                                  form.setError(`quantity.${item.id}`, {
                                    type: 'manual',
                                    message: t('orders.allocateItems.error.wrongQuantity', {
                                      count: maxValue,
                                      number: maxValue
                                    })
                                  });
                                } else {
                                  form.clearErrors(`quantity.${item.id}`);
                                }
                              }
                            }}
                            data-testid={`order-allocate-items-item-${item.id}-quantity-input`}
                          />
                        </Form.Control>
                        <Form.ErrorMessage
                          className="absolute -right-4 translate-x-full"
                          data-testid={`order-allocate-items-item-${item.id}-quantity-error`}
                        />
                      </Form.Item>
                    );
                  }}
                />

                <span
                  className={clx('shrink-0 text-ui-fg-subtle', disabled && 'text-ui-fg-disabled')}
                  data-testid={`order-allocate-items-item-${item.id}-quantity-label`}
                >
                  / {item.quantity} {t('fields.qty')}
                </span>
              </div>
            </div>
          )}

          {hasInventoryKit && (
            <div className="flex flex-1 items-center justify-end gap-x-4">
              <div className="flex items-center gap-1">
                <Form.Field
                  control={form.control}
                  name={`quantity.${item.id}-`}
                  rules={{
                    required: false,
                    min: minValue,
                    max: maxValue
                  }}
                  render={({ field }) => {
                    return (
                      <Form.Item className={clx(disabled && 'opacity-50')}>
                        <Form.Control>
                          <Input
                            className="txt-small w-[50px] rounded-lg bg-ui-bg-base text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            type="number"
                            {...field}
                            disabled={!locationId || disabled}
                            onChange={e => {
                              const val = e.target.value === '' ? null : Number(e.target.value);

                              onQuantityChange(
                                item.variant?.inventory[0],
                                item,
                                hasInventoryKit,
                                val,
                                true
                              );
                            }}
                          />
                        </Form.Control>
                      </Form.Item>
                    );
                  }}
                />{' '}
                <span className={clx('shrink-0 text-ui-fg-subtle', disabled && 'text-ui-fg-disabled')}>
                  / {item.quantity} {t('fields.qty')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasInventoryKit && (
        <div className="px-4 py-2">
          <div onClick={() => setIsOpen(o => !o)} className="flex cursor-pointer items-center gap-x-2">
            <TriangleDownMini
              style={{ transform: `rotate(${isOpen ? -90 : 0}deg)` }}
              className="-mt-[1px] text-ui-fg-muted"
              data-testid={`order-allocate-items-item-${item.id}-expand-icon`}
            />
            <span className="txt-small cursor-pointer text-ui-fg-muted">
              {t('orders.allocateItems.consistsOf', {
                num: inventory.length
              })}
            </span>
          </div>
        </div>
      )}

      {isOpen &&
        variant.inventory.map((i, ind) => {
          const location = i.location_levels?.find(l => l.location_id === locationId);

          const hasQuantityError =
            !!quantityField[`${item.id}-${i.id}`] &&
            quantityField[`${item.id}-${i.id}`] > location?.available_quantity;

          return (
            <div
              key={i.id}
              className="txt-small flex items-center gap-x-3 p-4"
              data-testid={`order-allocate-items-item-${item.id}-sub-item-${i.id}`}
            >
              <div className="flex flex-1 flex-row items-center gap-3">
                {hasQuantityError && (
                  <InformationCircleSolid
                    className="text-ui-fg-error"
                    data-testid={`order-allocate-items-item-${item.id}-sub-item-${i.id}-error-icon`}
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-ui-fg-subtle">{i.title}</span>
                  <span className="text-ui-fg-muted">
                    {t('orders.allocateItems.requires', {
                      num: variant.inventory_items[ind].required_quantity
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-row justify-between">
                <div className="flex items-center gap-3">
                  <Divider orientation="vertical" className="h-4" />

                  <div className="txt-small flex flex-col">
                    <span className="font-medium text-ui-fg-subtle">
                      {t('orders.allocateItems.available')}
                    </span>
                    <span className="text-ui-fg-muted">
                      {location?.available_quantity || '-'}
                      {location?.available_quantity && quantityField[`${item.id}-${i.id}`] && (
                        <span className="txt-small ml-1 text-red-500">
                          -{quantityField[`${item.id}-${i.id}`]}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Divider orientation="vertical" className="h-4" />

                  <div className="txt-small flex flex-col">
                    <span className="font-medium text-ui-fg-subtle">
                      {t('orders.allocateItems.inStock')}
                    </span>
                    <span className="text-ui-fg-muted">{location?.stocked_quantity || '-'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Divider orientation="vertical" className="h-4" />

                  <div className="txt-small mr-1 flex flex-row items-center gap-2 text-ui-fg-subtle">
                    <Form.Field
                      control={form.control}
                      name={`quantity.${item.id}-${i.id}`}
                      rules={{
                        required: true,
                        min: 0,
                        max: location?.available_quantity
                      }}
                      render={({ field }) => {
                        return (
                          <Form.Item>
                            <Form.Control>
                              <Input
                                className="txt-small w-[46px] rounded-lg bg-ui-bg-base text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                type="number"
                                {...field}
                                disabled={!locationId || disabled}
                                onChange={e => {
                                  const val = e.target.value === '' ? null : Number(e.target.value);

                                  onQuantityChange(i, item, hasInventoryKit, val);
                                }}
                                data-testid={`order-allocate-items-item-${item.id}-sub-item-${i.id}-input`}
                              />
                            </Form.Control>
                          </Form.Item>
                        );
                      }}
                    />
                    / {item.quantity * variant.inventory_items[ind].required_quantity}{' '}
                    {t('fields.qty')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
