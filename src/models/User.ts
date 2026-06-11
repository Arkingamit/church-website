import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole, MemberStatus } from '@/lib/types'; // We'll need to create this types file

export interface IUser extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  name: string; // Virtual or stored for easy access (firstName + lastName)
  gender: 'male' | 'female';
  birthday?: string;
  maritalStatus?: 'single' | 'married';
  marriageDate?: string;
  campusId: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  password?: string;
  role: UserRole;
  status: MemberStatus;
  groups: string[];
  qrCode?: string;
  familyMemberId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, default: '' },
    lastName: { type: String, required: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    birthday: { type: String },
    maritalStatus: { type: String, enum: ['single', 'married'] },
    marriageDate: { type: String },
    campusId: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    whatsapp: { type: String },
    password: { type: String }, // Optional for dummy users initially created by admin
    role: { 
      type: String, 
      enum: ['member', 'campus_leader', 'admin', 'super_admin'],
      default: 'member'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    groups: [{ type: String }],
    qrCode: { type: String },
    familyMemberId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Prevent mongoose from recompiling the model upon hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
