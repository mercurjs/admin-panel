import i18n from "i18next"
import { z } from "zod"

export const ClaimCreateSchema = z.object({
  inbound_items: z
    .array(
      z.object({
        item_id: z.string(),
        quantity: z.number(),
        reason_id: z.string().nullish(),
        note: z.string().nullish(),
      })
    )
    .min(1, i18n.t("orders.claims.validation.addAtLeastOneItem")),
  outbound_items: z.array(
    z.object({
      item_id: z.string(), // TODO: variant id?
      quantity: z.number(),
    })
  ),
  location_id: z
    .string({
      required_error: i18n.t("orders.claims.validation.chooseLocation"),
    })
    .min(1, i18n.t("orders.claims.validation.chooseLocation")),
  inbound_option_id: z.string().nullish(),
  outbound_option_id: z.string().nullish(),
  send_notification: z.boolean().optional(),
})

export type CreateClaimSchemaType = z.infer<typeof ClaimCreateSchema>
