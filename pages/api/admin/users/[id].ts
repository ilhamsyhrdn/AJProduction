import { NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import User from '@/server/database/models/User';
import { withAdmin, AuthenticatedRequest } from '@/server/utils/auth-middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const user = await User.findById(id).select('-password');
        
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, data: user });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    case 'PUT':
      try {
        const { role, isActive } = req.body;

        const updateData: any = {};
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;

        const user = await User.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, data: user });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    case 'DELETE':
      try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'User deleted successfully' 
        });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }
}

export default withAdmin(handler);
