import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
  workingHours: z.object({
    start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Must be HH:mm format'),
    end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Must be HH:mm format'),
    daysOfWeek: z.array(z.number().min(0).max(6))
  }).optional()
});
