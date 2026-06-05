import { Role } from '../../modules/auth/model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        organizationId: string;
        role: Role;
      };
    }
  }
}
