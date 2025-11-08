// Email templates for notifications
import { IOrder, IOrderItem } from '../database/models/Order';

export const orderConfirmationEmail = (order: IOrder) => {
  const itemsHTML = order.items.map((item: IOrderItem) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.name} x ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin: 0;">Order Confirmed! 🎉</h1>
    <p style="color: #666; margin: 10px 0 0 0;">Order #${order.orderNumber}</p>
  </div>

  <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 10px; margin-bottom: 20px;">
    <h2 style="margin-top: 0;">Order Details</h2>
    
    <table style="width: 100%; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f8f9fa;">
          <th style="padding: 10px; text-align: left;">Item</th>
          <th style="padding: 10px; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
        <tr>
          <td style="padding: 10px; font-weight: bold;">Subtotal</td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">
            Rp ${order.subtotal.toLocaleString('id-ID')}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px;">Shipping</td>
          <td style="padding: 10px; text-align: right;">
            Rp ${order.shippingCost.toLocaleString('id-ID')}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; font-size: 18px;">Total</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #27ae60;">
            Rp ${order.total.toLocaleString('id-ID')}
          </td>
        </tr>
      </tbody>
    </table>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
      <h3 style="margin-top: 0;">Shipping Address</h3>
      <p style="margin: 5px 0;"><strong>${order.shippingAddress.fullName}</strong></p>
      <p style="margin: 5px 0;">${order.shippingAddress.phone}</p>
      <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
      <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}</p>
    </div>

    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #ffc107;">
      <h3 style="margin-top: 0;">Payment Method: ${order.paymentMethod.replace('_', ' ').toUpperCase()}</h3>
      ${order.paymentMethod === 'bank_transfer' ? `
        <p><strong>Bank Transfer Details:</strong></p>
        <p>Bank: BCA<br>
        Account: 1234567890<br>
        Name: AJ Production</p>
        <p style="color: #856404;"><strong>Please complete your payment and upload the proof.</strong></p>
      ` : `
        <p>Payment will be collected upon delivery.</p>
      `}
    </div>
  </div>

  <div style="background: #e7f3ff; padding: 15px; border-radius: 10px; text-align: center;">
    <p style="margin: 0;">Track your order at:</p>
    <a href="${process.env.NEXTAUTH_URL}/account/orders/${order._id}" 
       style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
      View Order
    </a>
  </div>

  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
    <p>Thank you for shopping with AJ Production!</p>
    <p>For questions, contact us at support@ajproduction.com</p>
  </div>
</body>
</html>
  `;
};

export const orderStatusUpdateEmail = (order: IOrder, oldStatus: string, newStatus: string) => {
  const statusEmoji = {
    pending: '⏳',
    processing: '📦',
    shipped: '🚚',
  completed: '✅',
    cancelled: '❌'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin: 0;">Order Status Updated ${statusEmoji[newStatus as keyof typeof statusEmoji]}</h1>
    <p style="color: #666; margin: 10px 0 0 0;">Order #${order.orderNumber}</p>
  </div>

  <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 10px; margin-bottom: 20px;">
    <p style="font-size: 18px;">Your order status has been updated:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <span style="background: #e9ecef; padding: 10px 20px; border-radius: 20px; text-transform: capitalize;">
        ${oldStatus}
      </span>
      <span style="margin: 0 15px;">→</span>
      <span style="background: #28a745; color: white; padding: 10px 20px; border-radius: 20px; text-transform: capitalize;">
        ${newStatus}
      </span>
    </div>

    ${order.trackingNumber ? `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <p style="margin: 0;"><strong>Tracking Number:</strong></p>
        <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${order.trackingNumber}</p>
      </div>
    ` : ''}

    ${(newStatus === 'completed') ? `
      <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <p style="margin: 0; color: #155724;"><strong>Your order has been delivered!</strong></p>
        <p style="margin: 10px 0 0 0; color: #155724;">We hope you enjoy your purchase. Please leave a review!</p>
      </div>
    ` : ''}
  </div>

  <div style="text-align: center;">
    <a href="${process.env.NEXTAUTH_URL}/account/orders/${order._id}" 
       style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
      View Order Details
    </a>
  </div>

  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
    <p>Thank you for shopping with AJ Production!</p>
  </div>
</body>
</html>
  `;
};

export const adminNewOrderEmail = (order: IOrder) => {
  const itemsHTML = order.items.map((item: IOrderItem) => `
    <li>${item.name} x ${item.quantity} - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</li>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ffc107; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
    <h1 style="color: #000; margin: 0;">🔔 New Order Received!</h1>
    <p style="color: #333; margin: 10px 0 0 0;">Order #${order.orderNumber}</p>
  </div>

  <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2>Order Details</h2>
    <ul style="list-style: none; padding: 0;">
      ${itemsHTML}
    </ul>
    
    <p style="font-size: 18px; font-weight: bold; margin-top: 20px;">
      Total: Rp ${order.total.toLocaleString('id-ID')}
    </p>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
      <h3 style="margin-top: 0;">Customer Information</h3>
      <p style="margin: 5px 0;"><strong>${order.shippingAddress.fullName}</strong></p>
      <p style="margin: 5px 0;">${order.shippingAddress.phone}</p>
      <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
      <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.province}</p>
    </div>

    <div style="text-align: center; margin-top: 20px;">
      <a href="${process.env.NEXTAUTH_URL}/admin/orders" 
         style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
        Process Order
      </a>
    </div>
  </div>
</body>
</html>
  `;
};
