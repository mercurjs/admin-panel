import { z } from 'zod';
import { EditCategoryMediaSchema } from './const';

export type EditCategoryMediaSchemaType = z.infer<typeof EditCategoryMediaSchema>;
