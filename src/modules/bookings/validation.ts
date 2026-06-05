import { z } from 'zod';

export const createBookingSchema = z.object({
  resourceId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime()
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});
