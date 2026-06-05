import { Request, Response } from 'express';
import { register as registerService, registerEmployee as registerEmployeeService, login as loginService } from './service';
import { env } from '../../config/env';
import { registerSchema, loginSchema, registerEmployeeSchema } from './validation';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week 
};

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  try {
    const result = await registerService(data);
    res.cookie('token', result.token, cookieOptions);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: result.user._id,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.organization._id
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false, error: error.message
    });
  }
};

export const registerEmployee = async (req: Request, res: Response) => {
  const data = registerEmployeeSchema.parse(req.body);
  try {
    const result = await registerEmployeeService(data);
    res.cookie('token', result.token, cookieOptions);
    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        id: result.user._id,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  try {
    const result = await loginService(data);
    res.cookie('token', result.token, cookieOptions);
    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        id: result.user._id,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId
      }
    });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};
