import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Newsletter from '@/server/database/models/Newsletter';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      const { email } = req.body;

      // Validation
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if email already exists
      const existingSubscriber = await Newsletter.findOne({ email });

      if (existingSubscriber) {
        if (existingSubscriber.isActive) {
          return res.status(400).json({
            success: false,
            message: 'Email ini sudah terdaftar'
          });
        } else {
          // Reactivate subscription
          existingSubscriber.isActive = true;
          existingSubscriber.subscribedAt = new Date();
          await existingSubscriber.save();

          return res.status(200).json({
            success: true,
            message: 'Terima kasih! Subscription Anda telah diaktifkan kembali.'
          });
        }
      }

      // Create new subscriber
      await Newsletter.create({ email });

      res.status(201).json({
        success: true,
        message: 'Terima kasih telah berlangganan newsletter kami!'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
