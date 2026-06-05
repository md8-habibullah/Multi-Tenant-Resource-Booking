import { Request, Response } from 'express';
import { createBooking, getAvailability as getAvailabilityService } from './service';
import { Booking } from './model';
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

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ 
      userId: req.user!.id, 
      organizationId: req.user!.organizationId 
    }).sort({ startTime: 1 });
    res.json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const filter: any = { 
      _id: req.params.id, 
      organizationId: req.user!.organizationId 
    };
    if (req.user!.role !== 'ORG_ADMIN') {
      filter.userId = req.user!.id;
    }
    const booking = await Booking.findOneAndDelete(filter);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found or access denied' });
    }
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
