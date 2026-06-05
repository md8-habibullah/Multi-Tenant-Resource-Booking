import { Request, Response } from 'express';
import { AuthService } from './service';
import { registerSchema, loginSchema, registerEmployeeSchema } from './validation';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000
};

export class AuthController {
  static async register(req: Request, res: Response) {
    const data = registerSchema.parse(req.body);
    try {
      const result = await AuthService.register(data);
      res.cookie('token', result.token, cookieOptions);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: result.user._id,
          email: result.user.email,
          role: result.user.role,
          organizationId: result.organization._id
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async registerEmployee(req: Request, res: Response) {
    const data = registerEmployeeSchema.parse(req.body);
    try {
      const result = await AuthService.registerEmployee(data);
      res.cookie('token', result.token, cookieOptions);
      res.status(201).json({
        success: true,
        message: 'Employee registered successfully',
        user: {
          id: result.user._id,
          email: result.user.email,
          role: result.user.role,
          organizationId: result.user.organizationId
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    try {
      const result = await AuthService.login(data);
      res.cookie('token', result.token, cookieOptions);
      res.json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: result.user._id,
          email: result.user.email,
          role: result.user.role,
          organizationId: result.user.organizationId
        }
      });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
  }
}
