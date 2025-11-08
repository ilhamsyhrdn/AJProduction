/**
 * Server Utilities Index
 * 
 * Re-export all server utilities
 */

export { default as dbConnect } from './mongodb';
export { default as clientPromise } from './mongodb-client';
export { withAuth, withAdmin } from './auth-middleware';
export { orderConfirmationEmail, orderStatusUpdateEmail, adminNewOrderEmail } from './email-templates';
