import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Contact from '@/server/database/models/Contact';
import { withAdmin } from '@/server/utils/auth-middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  await dbConnect();

  try {
    if (req.method === 'DELETE') {
      const contact = await Contact.findByIdAndDelete(id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  } catch (error: any) {
    console.error('Error in contact API:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
}

// DELETE requires admin
export default withAdmin(handler);
