import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  date: string;
  author: string;
  image?: string;
  reactions: number;
  targetCampuses: string[];
  targetGroups: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    date: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String },
    reactions: { type: Number, default: 0 },
    targetCampuses: [{ type: String }],
    targetGroups: [{ type: String }],
  },
  { timestamps: true }
);

const Announcement: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement;
