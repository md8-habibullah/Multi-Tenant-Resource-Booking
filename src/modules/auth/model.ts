import mongoose, { Schema } from 'mongoose';

export enum Role {
  ORG_ADMIN = 'ORG_ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export interface IUser {
  email: string;
  passwordHash: string;
  organizationId: mongoose.Types.ObjectId;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.EMPLOYEE
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
