import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Product from '@/server/database/models/Product';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  await dbConnect();

  if (method === 'GET') {
    try {
      const { category, search, limit, page } = req.query;
      
  const query: Record<string, unknown> = {};
      
      // Admin can see ALL products (including inactive)
      
      // Filter by category
      if (category && category !== 'all') {
        query.category = category;
      }
      
      // Search by name or description
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 100;
      const skip = (pageNumber - 1) * limitNumber;

      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNumber)
        .skip(skip)
        .lean();

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
      console.error('Error fetching products:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  } else if (method === 'POST') {
    // Create new product (admin only via local header auth)
    try {
      const adminEmail = req.headers['x-admin-email'] as string;
      const adminRole = req.headers['x-admin-role'] as string;

      if (!(adminEmail === 'AJProduct@admin' && adminRole === 'admin')) {
        return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
      }

      const { name, description = '', price, category, stock = 0, image, shopeeLink } = req.body || {};

      // Normalize category to uppercase to satisfy enum in schema
      const normalizedCategory = typeof category === 'string' ? category.toUpperCase() : category;

      const doc = await Product.create({
        name,
        description,
        price: Number(price) || 0,
        category: normalizedCategory,
        stock: Number(stock) || 0,
        images: image ? [image] : [],
        shopeeLink,
        isActive: true,
      });

      return res.status(201).json({ success: true, data: doc, message: 'Product created' });
    } catch (error: any) {
      const msg = error?.message || 'Failed to create product';
      // Mongoose validation errors
      if (error?.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: msg });
      }
      console.error('Error creating product:', error);
      return res.status(500).json({ success: false, message: msg });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export default handler;

// Increase payload limit to allow base64 image from the Add Product form
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
