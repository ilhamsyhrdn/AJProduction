import { NextApiRequest, NextApiResponse } from 'next';

export interface AdminAuthRequest extends NextApiRequest {
  admin?: {
    email: string;
    role: string;
    name: string;
  };
}

type Handler = (req: AdminAuthRequest, res: NextApiResponse) => Promise<void> | void;

// Middleware untuk admin yang login via localStorage
export function withAdminLocal(handler: Handler) {
  return async (req: AdminAuthRequest, res: NextApiResponse) => {
    // Cek admin dari header (dikirim oleh frontend)
    const adminEmail = req.headers['x-admin-email'] as string;
    const adminRole = req.headers['x-admin-role'] as string;
    
    // Validasi admin credentials
    if (adminEmail === 'AJProduct@admin' && adminRole === 'admin') {
      req.admin = {
        email: adminEmail,
        role: adminRole,
        name: 'AJ Production Admin'
      };
      return handler(req, res);
    }

    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Admin access required' 
    });
  };
}
