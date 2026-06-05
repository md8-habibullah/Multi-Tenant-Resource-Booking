import { Request, Response } from 'express';
import { OrganizationService } from './service';
import { updateOrganizationSchema } from './validation';

export class OrganizationController {
  static async get(req: Request, res: Response) {
    try {
      const org = await OrganizationService.getOrganization(req.user!.organizationId);
      res.json(org);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    const data = updateOrganizationSchema.parse(req.body);
    try {
      const org = await OrganizationService.updateOrganization(req.user!.organizationId, data);
      res.json(org);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
