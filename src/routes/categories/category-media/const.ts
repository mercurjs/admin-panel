import { z } from 'zod';
import { MediaSchema } from '@routes/products/product-create/constants';

export const EditCategoryMediaSchema = z.object({
  media: z.array(MediaSchema)
});
