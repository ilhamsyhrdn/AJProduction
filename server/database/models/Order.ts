import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'cod' | 'bank_transfer' | 'midtrans';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  // Consolidated: removed 'delivered'. Use 'completed' as final fulfillment state.
  orderStatus: 'pending' | 'processing' | 'shipped' | 'cancelled' | 'completed';
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentDetails?: {
    transactionId?: string;
    paymentProof?: string;
    paidAt?: Date;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    required: true
  }
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  notes: String
});

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderNumber: {
      type: String,
      unique: true,
      immutable: true,
      default: function () {
        const date = new Date();
        const yyyy = date.getFullYear().toString();
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        const hh = date.getHours().toString().padStart(2, '0');
        const mi = date.getMinutes().toString().padStart(2, '0');
        const ss = date.getSeconds().toString().padStart(2, '0');
        const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `AJ${yyyy}${mm}${dd}${hh}${mi}${ss}${rand}`;
      }
    },
    items: [OrderItemSchema],
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'bank_transfer', 'midtrans'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      // Removed legacy 'delivered'; 'completed' now represents final delivered state.
      enum: ['pending', 'processing', 'shipped', 'cancelled', 'completed'],
      default: 'pending'
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    paymentDetails: {
      transactionId: String,
      paymentProof: String, // base64 or URL
      paymentProofMime: String,
      paymentProofOriginalName: String,
      paymentProofUploadedAt: Date,
      paidAt: Date
    },
    trackingNumber: String,
    notes: String
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });

// Note: orderNumber is generated via default() above, which runs before validation

// Ensure we can hot-reload enum change ('completed') during dev without needing a full server restart.
let Order: Model<IOrder>;
if (mongoose.models.Order) {
  // Recompile schema to ensure enum change (removal of 'delivered') takes effect in dev.
  delete mongoose.models.Order; // force regeneration with updated enum
  Order = mongoose.model<IOrder>('Order', OrderSchema);
} else {
  Order = mongoose.model<IOrder>('Order', OrderSchema);
}

export default Order;
