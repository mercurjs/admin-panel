import i18n from 'i18next';
import { z } from 'zod';

export const ExchangeCreateSchema = z.object({
  inbound_items: z
    .array(
      z.object({
        item_id: z.string(),
        quantity: z.number(),
        reason_id: z.string().nullish(),
        note: z.string().nullish()
      })
    )
    .min(1, i18n.t('orders.exchanges.validation.addAtLeastOneInboundItem')),
  outbound_items: z
    .array(
      z.object({
        item_id: z.string(),
        quantity: z.number()
      })
    )
    .min(1, i18n.t('orders.exchanges.validation.addAtLeastOneOutboundItem')),
  location_id: z
    .string({
      required_error: i18n.t('orders.exchanges.validation.chooseLocation')
    })
    .min(1, i18n.t('orders.exchanges.validation.chooseLocation')),
  inbound_option_id: z.string().nullish(),
  outbound_option_id: z
    .string({
      required_error: i18n.t('orders.exchanges.validation.chooseOutboundShipping')
    })
    .min(1, i18n.t('orders.exchanges.validation.chooseOutboundShipping')),
  send_notification: z.boolean().optional()
});

export type CreateExchangeSchemaType = z.infer<typeof ExchangeCreateSchema>;
