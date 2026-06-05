import { Resource } from './model';

export const create = async (organizationId: string, data: any) => {
  const resource = await Resource.create({ ...data, organizationId });
  return resource;
};

export const getAll = async (organizationId: string) => {
  return Resource.find({ organizationId, deletedAt: null });
};

export const getById = async (organizationId: string, resourceId: string) => {
  const resource = await Resource.findOne({
    _id: resourceId,
    organizationId,
    deletedAt: null
  });
  if (!resource) throw new Error('Resource not found');
  return resource;
};

export const update = async (organizationId: string, resourceId: string, data: any) => {
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
};

export const softDelete = async (organizationId: string, resourceId: string) => {
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
};
