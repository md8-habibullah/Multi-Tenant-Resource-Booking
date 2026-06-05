import { DateTime } from 'luxon';
import { Booking } from './model';
import { Resource } from '../resources/model';
import { Organization } from '../organizations/model';

function getWorkingHoursForDateTime(org: any, targetDt: DateTime, tz: string) {
  const [startHour, startMin] = org.workingHours.start.split(':').map(Number);
  const [endHour, endMin] = org.workingHours.end.split(':').map(Number);

  let workingStart = targetDt.set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
  let workingEnd = targetDt.set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });

  if (workingEnd <= workingStart) {
    workingEnd = workingEnd.plus({ days: 1 });
  }

  if (targetDt < workingStart) {
    const prevStart = workingStart.minus({ days: 1 });
    const prevEnd = workingEnd.minus({ days: 1 });
    if (targetDt >= prevStart && targetDt <= prevEnd) {
      return { workingStart: prevStart, workingEnd: prevEnd, shiftDate: targetDt.minus({ days: 1 }) };
    }
  }

  return { workingStart, workingEnd, shiftDate: targetDt };
}

export class BookingService {
  static async createBooking(organizationId: string, userId: string, data: any) {
    const { resourceId, startTime, endTime } = data;
    
    const org = await Organization.findById(organizationId);
    if (!org) throw new Error('Organization not found');

    const resource = await Resource.findOne({ _id: resourceId, organizationId, deletedAt: null });
    if (!resource) throw new Error('Resource not found');

    const tz = org.timezone;
    const startDt = DateTime.fromJSDate(new Date(startTime)).setZone(tz);
    const endDt = DateTime.fromJSDate(new Date(endTime)).setZone(tz);

    const { workingStart, workingEnd, shiftDate } = getWorkingHoursForDateTime(org, startDt, tz);

    if (!org.workingHours.daysOfWeek.includes(shiftDate.weekday)) {
      throw new Error('Booking is outside of working days');
    }

    if (startDt < workingStart || endDt > workingEnd) {
      throw new Error('Booking is outside of working hours');
    }

    const bufferTotalMs = (resource.bufferTimeBefore + resource.bufferTimeAfter) * 60000;

    const overlap = await Booking.findOne({
      resourceId,
      organizationId,
      startTime: { $lt: new Date(new Date(endTime).getTime() + bufferTotalMs) },
      endTime: { $gt: new Date(new Date(startTime).getTime() - bufferTotalMs) }
    });

    if (overlap) {
      throw new Error('Time slot is already booked or conflicts with buffer times');
    }

    const booking = await Booking.create({
      organizationId,
      userId,
      resourceId,
      startTime: new Date(startTime),
      endTime: new Date(endTime)
    });

    return booking;
  }

  static async getAvailability(organizationId: string, resourceId: string, dateStr: string) {
    const resource = await Resource.findOne({ _id: resourceId, organizationId, deletedAt: null });
    if (!resource) throw new Error('Resource not found');

    const org = await Organization.findById(organizationId);
    if (!org) throw new Error('Organization not found');

    const tz = org.timezone;
    const targetDate = DateTime.fromISO(dateStr, { zone: tz }).startOf('day');
    
    if (!targetDate.isValid) throw new Error('Invalid date format');

    if (!org.workingHours.daysOfWeek.includes(targetDate.weekday)) {
      return []; 
    }

    const [startHour, startMin] = org.workingHours.start.split(':').map(Number);
    const [endHour, endMin] = org.workingHours.end.split(':').map(Number);

    const workingStart = targetDate.set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
    let workingEnd = targetDate.set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });
    if (workingEnd <= workingStart) {
      workingEnd = workingEnd.plus({ days: 1 });
    }

    const existingBookings = await Booking.find({
      resourceId,
      organizationId,
      startTime: { $lt: workingEnd.toJSDate() },
      endTime: { $gt: workingStart.toJSDate() }
    }).sort({ startTime: 1 });

    const availableSlots = [];
    let currentStart: any = workingStart;

    for (const booking of existingBookings) {
      const bookingStart = DateTime.fromJSDate(booking.startTime).setZone(tz);
      const bookingEnd = DateTime.fromJSDate(booking.endTime).setZone(tz);

      const blockedStart = bookingStart.minus({ minutes: resource.bufferTimeBefore });
      const blockedEnd = bookingEnd.plus({ minutes: resource.bufferTimeAfter });

      if (currentStart < blockedStart) {
        const endOfSlot = blockedStart > workingEnd ? workingEnd : blockedStart;
        if (currentStart < endOfSlot) {
          availableSlots.push({
            start: currentStart.toISO(),
            end: endOfSlot.toISO()
          });
        }
      }

      if (currentStart < blockedEnd) {
        currentStart = blockedEnd;
      }
    }

    if (currentStart < workingEnd) {
      availableSlots.push({
        start: currentStart.toISO(),
        end: workingEnd.toISO()
      });
    }

    return availableSlots;
  }
}
