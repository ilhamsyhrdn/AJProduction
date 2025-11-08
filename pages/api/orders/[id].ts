import { NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Order from '@/server/database/models/Order';
import { withAuth, AuthenticatedRequest } from '@/server/utils/auth-middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;
  const userId = req.user?.id;
  const isAdmin = req.user?.role === 'admin';

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const query: any = { _id: id };
        if (!isAdmin) {
          query.user = userId; // Non-admin can only view their own orders
        }

        const order = await Order.findOne(query).populate('items.product user');

        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }

        return res.status(200).json({ success: true, data: order });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    case 'PUT':
      try {
  const { orderStatus, paymentStatus, trackingNumber, paymentDetails } = req.body;

        const query: any = { _id: id };
        if (!isAdmin) {
          query.user = userId;
        }

        const order = await Order.findOne(query);

        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only admin can update order status
        if (orderStatus && isAdmin) {
          order.orderStatus = orderStatus;
        }

        // Only admin can update payment status
        if (paymentStatus && isAdmin) {
          order.paymentStatus = paymentStatus;
        }

        // Admin can add tracking number
        if (trackingNumber && isAdmin) {
          order.trackingNumber = trackingNumber;
        }

        // User can upload payment proof for bank transfer
        if (paymentDetails && order.paymentMethod === 'bank_transfer') {
          // Basic validation
          if (paymentDetails.paymentProof && paymentDetails.paymentProof.length > 0) {
            // Limit size if sending base64 (rough check by length)
            if (paymentDetails.paymentProof.length > 5_000_000) { // ~5MB
              return res.status(400).json({ success: false, message: 'Payment proof too large' });
            }
          }
          order.paymentDetails = {
            ...(order.paymentDetails || {}),
            ...paymentDetails,
            paymentProofUploadedAt: paymentDetails.paymentProof ? new Date() : (order as any)?.paymentDetails?.paymentProofUploadedAt
          } as any; // Cast to any to include extended metadata fields
          // Optionally auto-set to pending payment verification
          if (paymentDetails.paymentProof && order.paymentStatus === 'pending') {
            order.paymentStatus = 'pending';
          }
        }

        await order.save();
        await order.populate('items.product user');

        return res.status(200).json({ success: true, data: order });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    case 'DELETE':
      try {
        if (!isAdmin) {
          return res.status(403).json({ 
            success: false, 
            message: 'Only admin can delete orders' 
          });
        }

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Order deleted successfully' 
        });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }
}

export default withAuth(handler);

// Increase body size limit to allow base64 payment proof uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb',
    },
  },
};
