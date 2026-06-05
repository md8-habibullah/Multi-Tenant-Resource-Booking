import { Resource } from './model';

export class ResourceService {
  static async create(organizationId: string, data: any) {
    const resource = await Resource.create({ ...data, organizationId });
    return resource;
  }

  static async getAll(organizationId: string) {
    return Resource.find({ organizationId, deletedAt: null });
  }

  static async getById(organizationId: string, resourceId: string) {
    const resource = await Resource.findOne({
      _id: resourceId,
      organizationId,
      deletedAt: null
    });
    if (!resource) throw new Error('Resource not found');
    return resource;
  }

  static async update(organizationId: string, resourceId: string, data: any) {
    const resource = await Resource.findOneAndUpdate(
      {
        _id: resourceId,
        organizationId,
        deletedAt: null
      },
      data,
      { new: true }
    );
    if (!resource) throw new Error('Resource not found');
    return resource;
  }

  static async softDelete(organizationId: string, resourceId: string) {
    const resource = await Resource.findOneAndUpdate(
      {
        _id: resourceId,
        organizationId,
        deletedAt: null
      },
      {
        deletedAt: new Date()
      },
      {
        new: true
      }
    );
    if (!resource) throw new Error('Resource not found');
    return resource;
  }
}
