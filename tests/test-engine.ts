import mongoose from 'mongoose';
import { connectDB } from '../src/config/database';
import { Organization } from '../src/modules/organizations/model';
import { Resource } from '../src/modules/resources/model';
import { Booking } from '../src/modules/bookings/model';
import { User, Role } from '../src/modules/auth/model';
import { createBooking, getAvailability } from '../src/modules/bookings/service';
import dotenv from 'dotenv';
import { DateTime } from 'luxon';

dotenv.config();

async function run() {
  await connectDB();
  
  console.log('Clearing old data...');
  await Organization.deleteMany({});
  await Resource.deleteMany({});
  await Booking.deleteMany({});
  await User.deleteMany({});

  console.log('Seeding data...');
  const org = await Organization.create({
    name: 'Test Org',
    timezone: 'UTC',
    workingHours: {
      start: '09:00',
      end: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7]
    }
  });

  const user = await User.create({
    email: 'test@example.com',
    passwordHash: 'dummy',
    organizationId: org._id,
    role: Role.ORG_ADMIN
  });

  const resource = await Resource.create({
    name: 'Test Room',
    organizationId: org._id,
    bufferTimeBefore: 15,
    bufferTimeAfter: 15
  });

  const today = DateTime.utc().toISODate();
  
  const startTime = DateTime.fromISO(`${today}T10:00:00Z`).toJSDate();
  const endTime = DateTime.fromISO(`${today}T11:00:00Z`).toJSDate();

  await createBooking(org._id.toString(), user._id.toString(), {
    resourceId: resource._id.toString(),
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()
  });

  console.log('Fetching availability...');
  const slots = await getAvailability(org._id.toString(), resource._id.toString(), today as string);
  
  console.log('Available slots:');
  console.log(JSON.stringify(slots, null, 2));

  if (slots.length !== 2) {
    console.error('Test Failed: Expected 2 slots, got ' + slots.length);
    process.exit(1);
  }

  const expectedStart1 = `${today}T09:00:00.000Z`;
  const expectedEnd1 = `${today}T09:45:00.000Z`;
  
  const expectedStart2 = `${today}T11:15:00.000Z`;
  const expectedEnd2 = `${today}T17:00:00.000Z`;

  if (slots[0].start !== expectedStart1 || slots[0].end !== expectedEnd1) {
    console.error('Test Failed: Slot 1 mismatch', slots[0]);
    process.exit(1);
  }

  if (slots[1].start !== expectedStart2 || slots[1].end !== expectedEnd2) {
    console.error('Test Failed: Slot 2 mismatch', slots[1]);
    process.exit(1);
  }

  console.log('Test Passed: Availability engine correctly subtracted existing booking and buffer times.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
