import { User, Role } from './model';
import { Organization } from '../organizations/model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  static async register(data: any) {
    const { email, password, organizationName } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const org = await Organization.create({ name: organizationName });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      organizationId: org._id,
      role: Role.ORG_ADMIN,
    });

    const token = jwt.sign(
      {
        id: user._id.toString(),
        organizationId: user.organizationId.toString(),
        role: user.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return { token, user, organization: org };
  }

  static async registerEmployee(data: any) {
    const { email, password, organizationId } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      throw new Error('Organization not found');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      organizationId: org._id,
      role: Role.EMPLOYEE,
    });

    const token = jwt.sign(
      {
        id: user._id.toString(),
        organizationId: user.organizationId.toString(),
        role: user.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return { token, user };
  }

  static async login(data: any) {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        organizationId: user.organizationId.toString(),
        role: user.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return { token, user };
  }
}
