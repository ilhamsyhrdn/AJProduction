import type { NextApiRequest, NextApiResponse } from 'next';
import { ORDER_STATUS_CONFIG, paymentStatusLabel } from '../../../src/constants/orderStatus';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const statuses = Object.keys(ORDER_STATUS_CONFIG);
    const hasCompleted = statuses.includes('completed');
    const hasDelivered = statuses.includes('delivered');

    const labels = {
      pending: paymentStatusLabel('pending'),
      paid: paymentStatusLabel('paid'),
      failed: paymentStatusLabel('failed'),
      refunded: paymentStatusLabel('refunded'),
    };

    return res.status(200).json({
      ok: true,
      statuses,
      hasCompleted,
      hasDelivered,
      labels
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e?.message || 'selftest failed' });
  }
}
