// pages/api/admin/products/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Product from '@/server/database/models/Product';
import { withAdminLocal } from '@/server/utils/admin-local-auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  console.log('API Request:', { method: req.method, id, body: req.body });

  try {
    await dbConnect();

    if (req.method === 'PUT') {
      // Update product (support optional image/images)
      const { name, price, category, stock, description, image, images } = req.body;

      console.log('Updating product with:', { name, price, category, stock, description, hasImage: !!image, imagesCount: images?.length });

      const updatePayload: any = { name, price, category, stock, description };
      if (Array.isArray(images) && images.length) {
        updatePayload.images = images;
      } else if (image) {
        updatePayload.images = [image];
      }

      const product = await Product.findByIdAndUpdate(
        id,
        updatePayload,
        { new: true, runValidators: true }
      );

      if (!product) {
        console.log('Product not found:', id);
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

  console.log('Product updated successfully:', product);
  return res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
    }

    if (req.method === 'DELETE') {
      // Delete product
      console.log('Deleting product:', id);
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        console.log('Product not found:', id);
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      console.log('Product deleted successfully');
      return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
}

export default withAdminLocal(handler);

// Increase body size to support base64 images in update
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};
