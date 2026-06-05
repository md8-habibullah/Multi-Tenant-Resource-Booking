import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  timezone: string;
  workingHours: {
    start: string; // '09:00'
    end: string;   // '17:00'
    daysOfWeek: number[]; // [1,2,3,4,5] for Mon-Fri
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema({
  name: { type: String, required: true },
  timezone: { type: String, required: true, default: 'UTC' },
  workingHours: {
    start: { type: String, required: true, default: '09:00' },
    end: { type: String, required: true, default: '17:00' },
    daysOfWeek: { type: [Number], required: true, default: [1, 2, 3, 4, 5] },
  }
}, { timestamps: true });

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
