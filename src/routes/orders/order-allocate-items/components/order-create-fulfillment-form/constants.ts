import { z } from "zod"

export const AllocateItemsSchema = z.object({
  quantity: z.record(z.string(), z.number().or(z.string())),
  selected_items: z.array(z.string()),
  location_id: z.string(),
})
