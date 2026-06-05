import { Organization } from './model';

export class OrganizationService {
  static async getOrganization(organizationId: string) {
    const org = await Organization.findById(organizationId);
    if (!org) throw new Error('Organization not found');
    return org;
  }

  static async updateOrganization(organizationId: string, data: any) {
    const org = await Organization.findByIdAndUpdate(organizationId, data, { new: true });
    if (!org) throw new Error('Organization not found');
    return org;
  }
}
