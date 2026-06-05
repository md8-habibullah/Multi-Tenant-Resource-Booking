import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  name: string;
  organizationId: mongoose.Types.ObjectId;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema = new Schema({
  name: { type: String, required: true },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  bufferTimeBefore: {
    type: Number,
    default: 0
  },
  bufferTimeAfter: {
    type: Number,
    default: 0
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
