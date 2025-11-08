import { NextApiResponse } from 'next';
import dbConnect from '@/server/utils/mongodb';
import Order from '@/server/database/models/Order';
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
        const orders = await Order.find({ user: userId })
          .sort({ createdAt: -1 })
          .populate('items.product');

        return res.status(200).json({ success: true, data: orders });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    case 'POST':
      try {
        const { shippingAddress, paymentMethod, notes, paymentDetails } = req.body;

        if (!shippingAddress || !paymentMethod) {
          return res.status(400).json({ 
            success: false, 
            message: 'Shipping address and payment method required' 
          });
        }

        // Get user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        
        if (!cart || cart.items.length === 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Cart is empty' 
          });
        }

        // Calculate totals
        const subtotal = cart.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);

        const shippingCost = 5000; // Fixed shipping cost
        const total = subtotal + shippingCost;

        // Create order
        const order = await Order.create({
          user: userId,
          items: cart.items.map(item => ({
            product: item.product,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          shippingAddress,
          paymentMethod,
          subtotal,
          shippingCost,
          total,
          notes,
          ...(paymentMethod === 'bank_transfer' && paymentDetails?.paymentProof
            ? { paymentDetails: {
                paymentProof: paymentDetails.paymentProof,
                paymentProofMime: paymentDetails.paymentProofMime,
                paymentProofOriginalName: paymentDetails.paymentProofOriginalName,
                paymentProofUploadedAt: new Date()
              }}
            : {})
        });

        // Update product stock
        for (const item of cart.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } }
          );
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        await order.populate('items.product');

        return res.status(201).json({ 
          success: true, 
          data: order,
          message: 'Order created successfully' 
        });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }
}

export default withAuth(handler);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb',
    },
  },
};
