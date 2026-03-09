import i18n from "i18next"
import { z } from "zod"

export const ReturnCreateSchema = z.object({
  items: z
    .array(
      z.object({
        item_id: z.string(),
        quantity: z.number(),
        reason_id: z.string().optional().nullable(),
        note: z.string().optional().nullable(),
      })
    )
    .min(1, i18n.t("orders.returns.pleaseAddAtLeastOneItem")),
  location_id: z
    .string()
    .min(1, i18n.t("orders.returns.pleaseChooseLocation")),
  option_id: z.string(),
  send_notification: z.boolean().optional(),
  // TODO: implement this
  receive_now: z.boolean().optional(),
})

export type ReturnCreateSchemaType = z.infer<typeof ReturnCreateSchema>
