import { z } from 'zod';

export const CreateShipmentSchema = z.object({
  labels: z.array(
    z.object({
      tracking_number: z.string().optional(),
      tracking_url: z.string().optional(),
      label_url: z.string().optional()
    })
  ),
  send_notification: z.boolean().optional()
});

export const defaultLabelValues = {
  tracking_number: '',
  tracking_url: '',
  label_url: ''
} as const;
