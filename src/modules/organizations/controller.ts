import { Request, Response } from 'express';
import { getOrganization, updateOrganization } from './service';
import { updateOrganizationSchema } from './validation';

export const get = async (req: Request, res: Response) => {
  try {
    const org = await getOrganization(req.user!.organizationId);
    res.json(org);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  const data = updateOrganizationSchema.parse(req.body);
  try {
    const org = await updateOrganization(req.user!.organizationId, data);
    res.json(org);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
