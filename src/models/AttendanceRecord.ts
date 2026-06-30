import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecord extends Document {
  sessionId?: string;
  eventId?: string;
  userId: string;
  date: string; // YYYY-MM-DD — the specific date this check-in is for (supports recurring sessions)
  markedAt: Date;
  distance: number; // in meters (how far they were from the center when checked in)
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    sessionId: { type: String, index: true },
    eventId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: String, index: true },
    markedAt: { type: Date, required: true, default: Date.now },
    distance: { type: Number, required: true },
  },
  { timestamps: true }
);

// Ensure a user can only check in once per session per date, or once per event per date
AttendanceRecordSchema.index({ sessionId: 1, userId: 1, date: 1 }, { unique: true, partialFilterExpression: { sessionId: { $exists: true } } });
AttendanceRecordSchema.index({ eventId: 1, userId: 1, date: 1 }, { unique: true, partialFilterExpression: { eventId: { $exists: true } } });

const AttendanceRecord = (mongoose.models.AttendanceRecord as mongoose.Model<IAttendanceRecord>) || mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
export default AttendanceRecord;
