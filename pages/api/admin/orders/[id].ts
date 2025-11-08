import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Order from '@/server/database/models/Order';
import { withAdminLocal } from '@/server/utils/admin-local-auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  await dbConnect();

  if (req.method === 'PUT') {
    try {
      const { orderStatus, paymentStatus } = req.body;

      if (!orderStatus && !paymentStatus) {
        return res.status(400).json({
          success: false,
          message: 'orderStatus or paymentStatus required'
        });
      }

      const update: any = {};
      if (orderStatus) update.orderStatus = orderStatus;
      if (paymentStatus) update.paymentStatus = paymentStatus;

      const order = await Order.findByIdAndUpdate(
        id,
        update,
        { new: true, runValidators: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
        message: 'Order updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating order:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update order'
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('Error fetching order:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch order'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}

export default withAdminLocal(handler);
