import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import User from '../database/models/User';
import dbConnect from './mongodb';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - Please login' 
      });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  await requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden - Admin access required' 
      });
    }
    next();
  });
}

// Helper to wrap middleware
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve) => {
      requireAuth(req, res, async () => {
        await handler(req, res);
        resolve();
      });
    });
  };
}

export function withAdmin(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve) => {
      requireAdmin(req, res, async () => {
        await handler(req, res);
        resolve();
      });
    });
  };
}
