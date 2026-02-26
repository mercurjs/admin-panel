import { z } from "zod"
import { MediaSchema } from "@routes/products/product-create/constants"

export const EditCollectionMediaSchema = z.object({
    media: z.array(MediaSchema),
  })