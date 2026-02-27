import { z } from 'zod';

export const CreateCategoryDetailsSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  handle: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  visibility: z.enum(['public', 'internal']),
  media: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      isThumbnail: z.boolean(),
      isBanner: z.boolean(),
      file: z.any()
    })
  ),
  icon: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        file: z.any()
      })
    )
    .nullable()
    .optional()
});

export const CreateCategorySchema = z
  .object({
    rank: z.number().nullable(),
    parent_category_id: z.string().nullable()
  })
  .merge(CreateCategoryDetailsSchema);

export type CreateCategorySchema = z.infer<typeof CreateCategorySchema>;
