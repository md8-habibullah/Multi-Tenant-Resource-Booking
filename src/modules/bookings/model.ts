import mongoose, { Schema } from 'mongoose';

export interface IBooking {
  resourceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
  resourceId: {
    type: Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  }
}, { timestamps: true });

BookingSchema.index({ resourceId: 1, startTime: 1, endTime: 1 });
BookingSchema.index({ organizationId: 1, startTime: 1, endTime: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
