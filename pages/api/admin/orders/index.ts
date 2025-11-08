import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Order from '@/server/database/models/Order';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Support both NextAuth and localStorage admin auth
  const _adminEmail = req.headers['x-admin-email'];
  const _adminRole = req.headers['x-admin-role'];

  await dbConnect();

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }

  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;

  const query: Record<string, unknown> = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    const pagination = {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    };

    return res.status(200).json({ success: true, data: orders, pagination });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export default handler;
