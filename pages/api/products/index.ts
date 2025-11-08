import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Product from '@/server/database/models/Product';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const { category, search, limit, page } = req.query;
        
  const query: Record<string, unknown> = { isActive: true };
        
        // Filter by category
        if (category && category !== 'SEMUA') {
          query.category = category;
        }
        
        // Search by name
        if (search) {
          query.$text = { $search: search as string };
        }

        // Pagination
        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        const products = await Product.find(query)
          .sort({ createdAt: -1 })
          .limit(limitNumber)
          .skip(skip);

        const total = await Product.countDocuments(query);

        res.status(200).json({
          success: true,
          data: products,
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

    case 'POST':
      try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
