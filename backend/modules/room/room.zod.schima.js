import { z } from 'zod';

export const createRoomSchima = z.object({
  body: z.object({
    romeName: z.string().min(3, 'Title must be at least 3 characters'),
    participants: z.array(z.string().email('Invalid email')).optional(),
    description: z.string().optional(),
    startTime: z.string().datetime('Invalid date format'),
    endTime: z.string().datetime().optional(),
    timezone: z
      .string()
      .min(1, 'Timezone is required')
      .refine((tz) => Intl.supportedValuesOf('timeZone').includes(tz), 'Invalid timezone'),

    // timezone: z.string(),
  }),
});
