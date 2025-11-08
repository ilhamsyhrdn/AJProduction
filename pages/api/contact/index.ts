import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Contact from '@/server/database/models/Contact';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'POST':
      try {
        const { firstName, lastName, email, phone, subject, message } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !phone || !subject || !message) {
          return res.status(400).json({
            success: false,
            message: 'All fields are required'
          });
        }

        // Create contact message
        const contact = await Contact.create({
          firstName,
          lastName,
          email,
          phone,
          subject,
          message,
          status: 'new'
        });

        // TODO: Send email notification to admin
        // You can use nodemailer or email service here

        res.status(201).json({
          success: true,
          message: 'Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.',
          data: contact
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
      break;

    case 'GET':
      // Admin only - get all messages
      try {
        const { status, page, limit } = req.query;

  const query: Record<string, unknown> = {};
        if (status) {
          query.status = status;
        }

        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 20;
        const skip = (pageNumber - 1) * limitNumber;

        const messages = await Contact.find(query)
          .sort({ createdAt: -1 })
          .limit(limitNumber)
          .skip(skip);

        const total = await Contact.countDocuments(query);

        res.status(200).json({
          success: true,
          data: messages,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            pages: Math.ceil(total / limitNumber)
          }
        });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
