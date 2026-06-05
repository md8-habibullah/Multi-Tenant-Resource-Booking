import mongoose from 'mongoose';
import { Organization } from './model';

export const getOrganization = async (organizationId: string) => {
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    throw new Error('Invalid organization ID format');
  }
  const org = await Organization.findById(
    new mongoose.Types.ObjectId(organizationId)
  );
  if (!org) throw new Error('Organization not found');
  return org;
};

export const updateOrganization = async (organizationId: string, data: any) => {
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    throw new Error('Invalid organization ID format');
  }
  const org = await Organization.findByIdAndUpdate(
    new mongoose.Types.ObjectId(organizationId),
    data, {
    new: true
  });
  if (!org) throw new Error('Organization not found');
  return org;
};
