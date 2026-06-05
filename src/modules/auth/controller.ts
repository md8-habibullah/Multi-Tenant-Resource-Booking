import { Request, Response } from 'express';
import { AuthService } from './service';
import { registerSchema, loginSchema } from './validation';

export class AuthController {
  static async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);
    try {
      const result = await AuthService.register(data);
      res.status(201).json({
        token: result.token,
        user: {
          id: result.user._id,
          email: result.user.email,
          role: result.user.role
        },
        organization: result.organization
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  static async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    try {
      const result = await AuthService.login(data);
      res.json({
        token: result.token,
        user: {
          id: result.user._id,
          email: result.user.email,
          role: result.user.role
        }
      });
    } catch (error: any) {
      res.status(401).json({
        error: error.message
      });
    }
  }
}
