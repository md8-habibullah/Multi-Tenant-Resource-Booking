import { Request, Response } from 'express';
import { User } from '../auth/model';

export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await User.find({ organizationId: req.user!.organizationId })
      .select('-passwordHash')
      .lean();
    res.json({
      success: true,
      data: members
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
