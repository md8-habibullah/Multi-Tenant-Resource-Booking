import { Request, Response } from 'express';
import { ResourceService } from './service';
import { createResourceSchema, updateResourceSchema } from './validation';

export class ResourceController {
  static async create(req: Request, res: Response) {
    const data = createResourceSchema.parse(req.body);
    try {
      const resource = await ResourceService.create(req.user!.organizationId, data);
      res.status(201).json(resource);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const resources = await ResourceService.getAll(req.user!.organizationId);
      res.json(resources);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const resource = await ResourceService.getById(req.user!.organizationId, req.params.id as string);
      res.json(resource);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    const data = updateResourceSchema.parse(req.body);
    try {
      const resource = await ResourceService.update(req.user!.organizationId, req.params.id as string, data);
      res.json(resource);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async softDelete(req: Request, res: Response) {
    try {
      await ResourceService.softDelete(req.user!.organizationId, req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
