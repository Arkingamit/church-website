import mongoose, { Document, Model } from 'mongoose';

export interface IPrayerRequest extends Document {
  title: string;
  content: string;
  authorName: string;
  authorId?: mongoose.Types.ObjectId | string;
  isAnonymous: boolean;
  privacy: 'public' | 'members' | 'staff';
  category: string;
  prayedCount: number;
  prayedBy: string[]; // Array of IPs or User IDs
  comments: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const prayerRequestSchema = new mongoose.Schema<IPrayerRequest>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorName: { type: String, required: true, default: 'Anonymous' },
    authorId: { type: mongoose.Schema.Types.Mixed }, // Could be ObjectId if logged in
    isAnonymous: { type: Boolean, default: false },
    privacy: { 
      type: String, 
      enum: ['public', 'members', 'staff'], 
      default: 'public' 
    },
    category: { type: String, default: 'General' },
    prayedCount: { type: Number, default: 0 },
    prayedBy: { type: [String], default: [] },
    comments: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'approved' // Set to approved by default so they show up immediately
    },
  },
  {
    timestamps: true,
  }
);

// Format the returned object to map _id to id
prayerRequestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: Record<string, any>) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

const PrayerRequest: Model<IPrayerRequest> =
  mongoose.models.PrayerRequest || mongoose.model<IPrayerRequest>('PrayerRequest', prayerRequestSchema);

export default PrayerRequest;
