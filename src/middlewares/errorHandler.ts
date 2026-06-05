import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.issues,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Mongoose Validation Error',
      details: err.message,
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
