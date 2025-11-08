/* eslint-disable */
// Migration script: delivered -> completed for Order.orderStatus
// Usage (PowerShell): node scripts/migrate-order-status.js --dry-run
// Requires: process.env.MONGODB_URI

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI in environment. Aborting.');
  process.exit(1);
}

const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-n');

async function run() {
  const start = Date.now();
  console.log(`[migrate-order-status] Connecting to MongoDB...`);
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });

  const db = mongoose.connection.db;
  const collectionName = 'orders';
  const col = db.collection(collectionName);

  const query = { orderStatus: 'delivered' };
  const count = await col.countDocuments(query);
  console.log(`[migrate-order-status] Found ${count} document(s) with orderStatus='delivered'.`);

  if (count === 0) {
    console.log('[migrate-order-status] Nothing to migrate. Exiting.');
    await mongoose.disconnect();
    return;
  }

  if (isDryRun) {
    console.log('[migrate-order-status] DRY RUN: no changes will be applied.');
    await mongoose.disconnect();
    return;
  }

  const res = await col.updateMany(query, { $set: { orderStatus: 'completed' } });
  console.log(`[migrate-order-status] Updated ${res.modifiedCount} document(s) to orderStatus='completed'.`);

  await mongoose.disconnect();
  console.log(`[migrate-order-status] Done in ${((Date.now() - start) / 1000).toFixed(2)}s.`);
}

run().catch((err) => {
  console.error('[migrate-order-status] Migration failed:', err);
  process.exit(1);
});
