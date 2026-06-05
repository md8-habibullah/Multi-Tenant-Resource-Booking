import { z } from 'zod';

export const createResourceSchema = z.object({
  name: z.string().min(1),
  bufferTimeBefore: z.number().min(0).optional(),
  bufferTimeAfter: z.number().min(0).optional(),
});

export const updateResourceSchema = z.object({
  name: z.string().min(1).optional(),
  bufferTimeBefore: z.number().min(0).optional(),
  bufferTimeAfter: z.number().min(0).optional(),
});
