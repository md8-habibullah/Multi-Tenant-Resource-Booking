import { DateTime } from 'luxon';
import { Booking } from './model';
import { Resource } from '../resources/model';
import { Organization } from '../organizations/model';

function getShift(org: any, targetDt: DateTime, tz: string) {
  const [startHour, startMin] = org.workingHours.start.split(':').map(Number);
  const [endHour, endMin] = org.workingHours.end.split(':').map(Number);

  let shiftStart = targetDt.set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
  let shiftEnd = targetDt.set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });

  if (shiftEnd <= shiftStart) {
    shiftEnd = shiftEnd.plus({ days: 1 });
  }

  if (targetDt < shiftStart) {
    const prevStart = shiftStart.minus({ days: 1 });
    const prevEnd = shiftEnd.minus({ days: 1 });
    if (targetDt >= prevStart && targetDt <= prevEnd) {
      return { shiftStart: prevStart, shiftEnd: prevEnd, shiftDate: targetDt.minus({ days: 1 }) };
    }
  }

  return { shiftStart, shiftEnd, shiftDate: targetDt };
}

import mongoose from 'mongoose';

export const createBooking = async (organizationId: string, userId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { resourceId, startTime, endTime } = data;

    const org = await Organization.findById(organizationId).session(session);
    if (!org) throw new Error('Organization not found');

    const resource = await Resource.findOne({ _id: resourceId, organizationId, deletedAt: null }).session(session);
    if (!resource) throw new Error('Resource not found');

    const tz = org.timezone;
    const startDt = DateTime.fromJSDate(new Date(startTime)).setZone(tz);
    const endDt = DateTime.fromJSDate(new Date(endTime)).setZone(tz);

    const { shiftStart, shiftEnd, shiftDate } = getShift(org, startDt, tz);

    if (!org.workingHours.daysOfWeek.includes(shiftDate.weekday)) {
      throw new Error('Booking is outside of working days');
    }

    if (startDt < shiftStart || endDt > shiftEnd) {
      throw new Error('Booking is outside of working hours');
    }

    const bufferMs = (resource.bufferTimeBefore + resource.bufferTimeAfter) * 60000;

    const overlap = await Booking.findOne({
      resourceId,
      organizationId,
      startTime: { $lt: new Date(new Date(endTime).getTime() + bufferMs) },
      endTime: { $gt: new Date(new Date(startTime).getTime() - bufferMs) }
    }).session(session);

    if (overlap) {
      throw new Error('Time slot is already booked or conflicts with buffer times');
    }

    const [booking] = await Booking.create([{
      organizationId,
      userId,
      resourceId,
      startTime: new Date(startTime),
      endTime: new Date(endTime)
    }], { session });

    await session.commitTransaction();
    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getAvailability = async (organizationId: string, resourceId: string, dateStr: string) => {
  const resource = await Resource.findOne({ _id: resourceId, organizationId, deletedAt: null });
  if (!resource) throw new Error('Resource not found');

  const org = await Organization.findById(organizationId);
  if (!org) throw new Error('Organization not found');

  const tz = org.timezone;
  const targetDate = DateTime.fromISO(dateStr, {
    zone: tz
  }).startOf('day');

  if (!targetDate.isValid) throw new Error('Invalid date format');

  if (!org.workingHours.daysOfWeek.includes(targetDate.weekday)) {
    return [];
  }

  const [startHour, startMin] = org.workingHours.start.split(':').map(Number);
  const [endHour, endMin] = org.workingHours.end.split(':').map(Number);

  const shiftStart = targetDate.set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
  let shiftEnd = targetDate.set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });
  if (shiftEnd <= shiftStart) {
    shiftEnd = shiftEnd.plus({
      days: 1
    });
  }

  const existingBookings = await Booking.find({
    resourceId,
    organizationId,
    startTime: {
      $lt: shiftEnd.toJSDate()
    },
    endTime: {
      $gt: shiftStart.toJSDate()
    }
  }).sort({ startTime: 1 });

  const availableSlots = [];
  let currentStart: any = shiftStart;

  for (const booking of existingBookings) {
    const bookingStart = DateTime.fromJSDate(booking.startTime).setZone(tz);
    const bookingEnd = DateTime.fromJSDate(booking.endTime).setZone(tz);

    const blockedStart = bookingStart.minus({
      minutes: resource.bufferTimeBefore
    });
    const blockedEnd = bookingEnd.plus({
      minutes: resource.bufferTimeAfter
    });

    if (currentStart < blockedStart) {
      const endOfSlot = blockedStart > shiftEnd ? shiftEnd : blockedStart;
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

  if (currentStart < shiftEnd) {
    availableSlots.push({
      start: currentStart.toISO(),
      end: shiftEnd.toISO()
    });
  }

  return availableSlots;
};

