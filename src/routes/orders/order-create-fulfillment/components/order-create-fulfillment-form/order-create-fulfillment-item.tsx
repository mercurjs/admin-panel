import { useMemo } from 'react';

import { InformationCircleSolid } from '@medusajs/icons';
import { HttpTypes } from '@medusajs/types';
import { Checkbox, CheckboxCheckedState, clx, Divider, Input, Text, Tooltip } from '@medusajs/ui';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';

import { Form } from '../../../../../components/common/form/index';
import { Thumbnail } from '../../../../../components/common/thumbnail/index';
import { useProductVariant } from '../../../../../hooks/api/products';
import { getFulfillableQuantity } from '../../../../../lib/order-item';
import { CreateFulfillmentSchema } from './constants';

type OrderEditItemProps = {
  item: HttpTypes.AdminOrderLineItem;
  currencyCode: string;
  locationId?: string;
  onItemRemove: (itemId: string) => void;
  reservations: HttpTypes.AdminReservation[];
  form: UseFormReturn<zod.infer<typeof CreateFulfillmentSchema>>;
  disabled: boolean;
  managedByAdmin: boolean;
};

export function OrderCreateFulfillmentItem({
  item,
  form,
  locationId,
  reservations,
  disabled,
  managedByAdmin
}: OrderEditItemProps) {
  const { t } = useTranslation();

  const { variant } = useProductVariant(
    item.product_id,
    item.variant_id,
    {
      fields: '*inventory,*inventory.location_levels,*inventory_items'
    },
    {
      enabled: !!item.variant
    }
  );

  const { availableQuantity, inStockQuantity } = useMemo(() => {
    if (!variant?.inventory_items?.length || !variant?.inventory?.length || !locationId) {
      return {};
    }

    const { inventory, inventory_items } = variant;

    const locationHasEveryInventoryItem = inventory.every(i =>
      i.location_levels?.find(inv => inv.location_id === locationId)
    );

    if (!locationHasEveryInventoryItem) {
      return {};
    }

    const inventoryItemRequiredQuantityMap = new Map(
      inventory_items.map(i => [i.inventory_item_id, i.required_quantity])
    );

    // since we don't allow split fulifllments only one reservation from inventory kit is enough to calculate avalabel product quantity
    const reservation = reservations?.find(r => r.line_item_id === item.id);
    const iitemRequiredQuantity = inventory_items.find(
      i => i.inventory_item_id === reservation?.inventory_item_id
    )?.required_quantity;

    const reservedQuantityForItem = !reservation
      ? 0
      : reservation?.quantity / (iitemRequiredQuantity || 1);

    const locationInventoryLevels = inventory.map(i => {
      const level = i.location_levels?.find(inv => inv.location_id === locationId);

      const requiredQuantity = inventoryItemRequiredQuantityMap.get(i.id);

      if (!level || !requiredQuantity) {
        return {
          availableQuantity: Number.MAX_SAFE_INTEGER,
          stockedQuantity: Number.MAX_SAFE_INTEGER
        };
      }

      const availableQuantity = level.available_quantity / requiredQuantity;
      const stockedQuantity = level.stocked_quantity / requiredQuantity;

      return {
        availableQuantity,
        stockedQuantity
      };
    });

    const maxAvailableQuantity = Math.min(...locationInventoryLevels.map(i => i.availableQuantity));

    const maxStockedQuantity = Math.min(...locationInventoryLevels.map(i => i.stockedQuantity));

    if (
      maxAvailableQuantity === Number.MAX_SAFE_INTEGER ||
      maxStockedQuantity === Number.MAX_SAFE_INTEGER
    ) {
      return {};
    }

    return {
      availableQuantity: Math.floor(maxAvailableQuantity + reservedQuantityForItem),
      inStockQuantity: Math.floor(maxStockedQuantity)
    };
  }, [variant, locationId, reservations]);

  const minValue = 0;
  const maxValue = Math.min(
    getFulfillableQuantity(item),
    availableQuantity || Number.MAX_SAFE_INTEGER
  );

  const watchedSelectedItems = useWatch({
    name: 'selected_items',
    control: form.control
  });

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
      data-testid={`order-create-fulfillment-item-${item.id}`}
    >
      <div
        className="flex flex-row items-center"
        data-testid={`order-create-fulfillment-item-${item.id}-content`}
      >
        <div className="ml-3 inline-flex items-center">
          {disabled ? (
            <Tooltip
              content={
                managedByAdmin
                  ? t('orders.fulfillment.disabledItemTooltip')
                  : t('orders.fulfillment.disabledItemTooltipManagedByVendor')
              }
              side="top"
              className="text-center"
            >
              <InformationCircleSolid
                className="text-ui-tag-orange-icon"
                data-testid={`order-create-fulfillment-item-${item.id}-disabled-indicator`}
              />
            </Tooltip>
          ) : (
            <Checkbox
              checked={watchedSelectedItems.includes(item.id)}
              onCheckedChange={checked => {
                handleSelectItem(checked, item.id);
              }}
            />
          )}
        </div>

        <div
          className={clx(
            'flex flex-1 flex-col gap-x-4 gap-y-2 py-2 pl-4 pr-3 text-sm sm:flex-row',
            disabled && 'pointer-events-none text-ui-fg-disabled'
          )}
          data-testid={`order-create-fulfillment-item-${item.id}-details`}
        >
          <div
            className="flex flex-1 items-center gap-x-4"
            data-testid={`order-create-fulfillment-item-${item.id}-info`}
          >
            <div className={clx(disabled && 'opacity-50')}>
              <Thumbnail
                src={item.thumbnail}
                data-testid={`order-create-fulfillment-item-${item.id}-thumbnail`}
              />
            </div>
            <div
              className="flex flex-col"
              data-testid={`order-create-fulfillment-item-${item.id}-text`}
            >
              <div data-testid={`order-create-fulfillment-item-${item.id}-title`}>
                <Text
                  className="txt-small"
                  as="span"
                  weight="plus"
                >
                  {item.title}
                </Text>{' '}
                {item.variant_sku && (
                  <span data-testid={`order-create-fulfillment-item-${item.id}-sku`}>
                    ({item.variant_sku})
                  </span>
                )}
              </div>
              <Text
                as="div"
                className={clx('txt-small text-ui-fg-subtle', disabled && 'text-ui-fg-disabled')}
                data-testid={`order-create-fulfillment-item-${item.id}-variant-title`}
              >
                {item.variant_title}
              </Text>
            </div>
          </div>

          <div
            className="flex flex-1 items-center gap-x-4"
            data-testid={`order-create-fulfillment-item-${item.id}-quantities`}
          >
            <Divider
              orientation="vertical"
              className="h-4"
            />
            <div
              className="text-small flex flex-1 flex-col"
              data-testid={`order-create-fulfillment-item-${item.id}-available`}
            >
              <span
                className="font-medium"
                data-testid={`order-create-fulfillment-item-${item.id}-available-label`}
              >
                {t('orders.fulfillment.available')}
              </span>
              <span
                className={clx('text-ui-fg-subtle', disabled && 'text-ui-fg-disabled')}
                data-testid={`order-create-fulfillment-item-${item.id}-available-value`}
              >
                {availableQuantity || 'N/A'}
              </span>
            </div>
            <Divider
              orientation="vertical"
              className="h-4"
            />
            <div
              className="flex flex-1 items-center gap-x-1"
              data-testid={`order-create-fulfillment-item-${item.id}-in-stock`}
            >
              <div className="flex flex-col">
                <span
                  className="font-medium"
                  data-testid={`order-create-fulfillment-item-${item.id}-in-stock-label`}
                >
                  {t('orders.fulfillment.inStock')}
                </span>
                <span
                  className={clx('text-ui-fg-subtle', disabled && 'text-ui-fg-disabled')}
                  data-testid={`order-create-fulfillment-item-${item.id}-in-stock-value`}
                >
                  {inStockQuantity || 'N/A'}{' '}
                  {inStockQuantity && (
                    <span
                      className="font-medium text-red-500"
                      data-testid={`order-create-fulfillment-item-${item.id}-in-stock-reserved`}
                    >
                      -{form.getValues(`quantity.${item.id}`)}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div
              className="flex items-center gap-1"
              data-testid={`order-create-fulfillment-item-${item.id}-quantity-input-section`}
            >
              <Form.Field
                control={form.control}
                name={`quantity.${item.id}`}
                rules={{ required: true, min: minValue, max: maxValue }}
                render={({ field }) => {
                  return (
                    <Form.Item
                      className={clx(disabled && 'opacity-50')}
                      data-testid={`order-create-fulfillment-item-${item.id}-quantity-item`}
                    >
                      <Form.Control
                        data-testid={`order-create-fulfillment-item-${item.id}-quantity-control`}
                      >
                        <Input
                          className="txt-small w-[50px] rounded-lg bg-ui-bg-base text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          {...field}
                          onChange={e => {
                            const val = e.target.value === '' ? null : Number(e.target.value);

                            field.onChange(val);

                            if (!isNaN(val)) {
                              if (val < minValue || val > maxValue) {
                                form.setError(`quantity.${item.id}`, {
                                  type: 'manual',
                                  message: t('orders.fulfillment.error.wrongQuantity', {
                                    count: maxValue,
                                    number: maxValue
                                  })
                                });
                              } else {
                                form.clearErrors(`quantity.${item.id}`);
                              }
                            }
                          }}
                          data-testid={`order-create-fulfillment-item-${item.id}-quantity-input`}
                        />
                      </Form.Control>
                      <Form.ErrorMessage
                        className="absolute -right-4 translate-x-full"
                        data-testid={`order-create-fulfillment-item-${item.id}-quantity-error`}
                      />
                    </Form.Item>
                  );
                }}
              />

              <span
                className={clx('shrink-0 text-ui-fg-subtle', disabled && 'text-ui-fg-disabled')}
                data-testid={`order-create-fulfillment-item-${item.id}-quantity-label`}
              >
                / {item.quantity} {t('fields.qty')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
