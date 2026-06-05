import { Request, Response } from 'express';
import { createBooking, getAvailability as getAvailabilityService } from './service';
import { createBookingSchema } from './validation';

export const create = async (req: Request, res: Response) => {
  const data = createBookingSchema.parse(req.body);
  try {
    const booking = await createBooking(req.user!.organizationId, req.user!.id, data);
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json(
      {
        error: error.message
      }
    );
  }
};

export const getAvailability = async (req: Request, res: Response) => {
  const { resourceId } = req.params;
  const { date } = req.query;

  if (!date || typeof date !== 'string') {
    return res.status(400).json(
      {
        error: 'Date query parameter is required (YYYY-MM-DD)'
      }
    );
  }

  try {
    const slots = await getAvailabilityService(req.user!.organizationId, resourceId as string, date as string);
    res.json(slots);
  } catch (error: any) {
    res.status(400).json(
      {
        error: error.message
      }
    );
  }
};
