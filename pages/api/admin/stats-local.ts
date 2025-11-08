import { NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Order from '@/server/database/models/Order';
import Product from '@/server/database/models/Product';
import Contact from '@/server/database/models/Contact';
import Newsletter from '@/server/database/models/Newsletter';
import User from '@/server/database/models/User';
import { withAdminLocal, AdminAuthRequest } from '@/server/utils/admin-local-auth';

async function handler(req: AdminAuthRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }

  try {
    // Get statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'completed' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
    
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const newCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const newMessages = await Contact.countDocuments({ status: 'new' });
    const totalSubscribers = await Newsletter.countDocuments({ status: 'active' });

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .select('orderNumber total orderStatus paymentStatus createdAt shippingAddress');

    // Top products (most ordered)
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Order status distribution
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalProducts,
          lowStockProducts,
          totalCustomers,
          newCustomers,
          newMessages,
          totalSubscribers
        },
        recentOrders,
        topProducts,
        revenueByMonth,
        ordersByStatus
      }
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch dashboard stats' 
    });
  }
}

export default withAdminLocal(handler);
