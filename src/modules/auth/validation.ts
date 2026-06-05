import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  organizationName: z.string().min(1, 'Organization name is required'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const registerEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  organizationId: z.string(),
});
