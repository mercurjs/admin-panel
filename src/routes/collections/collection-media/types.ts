import { z } from "zod"
import { EditCollectionMediaSchema } from "@routes/collections/collection-media/constants"


export type EditCollectionMediaSchemaType = z.infer<typeof EditCollectionMediaSchema>
