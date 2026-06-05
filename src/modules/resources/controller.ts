import { Request, Response } from 'express';
import {
  create as createResource,
  getAll as getAllResources,
  getById as getResourceById,
  update as updateResource,
  softDelete as softDeleteResource
} from './service';
import { createResourceSchema, updateResourceSchema } from './validation';

export const create = async (req: Request, res: Response) => {
  const data = createResourceSchema.parse(req.body);
  try {
    const resource = await createResource(req.user!.organizationId, data);
    res.status(201).json(resource);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const resources = await getAllResources(req.user!.organizationId);
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const resource = await getResourceById(req.user!.organizationId, req.params.id as string);
    res.json(resource);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  const data = updateResourceSchema.parse(req.body);
  try {
    const resource = await updateResource(req.user!.organizationId, req.params.id as string, data);
    res.json(resource);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const softDelete = async (req: Request, res: Response) => {
  try {
    await softDeleteResource(req.user!.organizationId, req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
