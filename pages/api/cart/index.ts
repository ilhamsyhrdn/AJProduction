import { NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Cart from '@/server/database/models/Cart';
import Product from '@/server/database/models/Product';
import { withAuth, AuthenticatedRequest } from '@/server/utils/auth-middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await dbConnect();

  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        let cart = await Cart.findOne({ user: userId }).populate('items.product');
        
        if (!cart) {
          cart = await Cart.create({ user: userId, items: [] });
        }

        return res.status(200).json({ success: true, data: cart });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    case 'POST':
      try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
          return res.status(400).json({ success: false, message: 'Product ID required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
          cart = await Cart.create({ user: userId, items: [] });
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
          item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
          // Update quantity
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          cart.items.push({
            product: productId,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images[0] || '/gambarProduct/placeholder.jpg'
          });
        }

        await cart.save();
        await cart.populate('items.product');

        return res.status(200).json({ success: true, data: cart });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    case 'PUT':
      try {
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
          return res.status(400).json({ 
            success: false, 
            message: 'Product ID and quantity required' 
          });
        }

        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
          return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
          item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
          return res.status(404).json({ success: false, message: 'Item not in cart' });
        }

        if (quantity <= 0) {
          // Remove item
          cart.items.splice(itemIndex, 1);
        } else {
          // Update quantity
          cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        await cart.populate('items.product');

        return res.status(200).json({ success: true, data: cart });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    case 'DELETE':
      try {
        const { productId } = req.query;

        if (!productId) {
          return res.status(400).json({ success: false, message: 'Product ID required' });
        }

        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
          return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        cart.items = cart.items.filter(
          item => item.product.toString() !== productId
        );

        await cart.save();
        await cart.populate('items.product');

        return res.status(200).json({ success: true, data: cart });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }
}

export default withAuth(handler);
