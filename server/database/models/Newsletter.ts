import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Removed duplicate index (unique already creates index); prevents mongoose duplicate warning.

const Newsletter: Model<INewsletter> = 
  mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema);

export default Newsletter;
