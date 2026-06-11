import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICampus extends Document {
  name: string;
  pastor: string;
  createdAt: Date;
  updatedAt: Date;
}

const CampusSchema = new Schema<ICampus>(
  {
    name: { type: String, required: true, unique: true },
    pastor: { type: String, required: true },
  },
  { timestamps: true }
);

const Campus: Model<ICampus> = mongoose.models.Campus || mongoose.model<ICampus>('Campus', CampusSchema);

export default Campus;
