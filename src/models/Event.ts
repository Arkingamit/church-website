import mongoose, { Schema, Document, Model } from 'mongoose';
import { FormField } from '@/lib/types';

export interface IEventScheduleDay {
  date: string;
  startTime: string;
  endTime: string;
  label?: string;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  category: string;
  capacity: number;
  registered: number;
  image?: string;
  recurring: boolean;
  recurrencePattern?: string;
  recurrenceDay?: string;
  recurrenceWeekOfMonth?: string;
  recurrenceEndDate?: string;
  recurrenceNote?: string;
  seriesId?: string;
  isSeriesTemplate?: boolean;
  nextOccurrence?: string;
  lastTriggered?: string;
  mapUrl?: string;
  host: string;
  targetCampuses: string[];
  targetGroups: string[];
  googlePhotosUrl?: string;
  formFields?: FormField[];
  isMultiDay: boolean;
  endDate?: string;
  schedule?: IEventScheduleDay[];
  reminders?: string[];
  customReminders?: { daysBefore: number; hoursBefore: number; minutesBefore: number; }[];
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const FormFieldSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['text', 'textarea', 'radio', 'checkbox', 'select', 'date'], required: true },
    label: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: [FormFieldOptionSchema],
  },
  { _id: false }
);

const EventScheduleDaySchema = new Schema(
  {
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    label: { type: String },
  },
  { _id: false }
);

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    capacity: { type: Number, required: true, default: 0 },
    registered: { type: Number, default: 0 },
    image: { type: String },
    recurring: { type: Boolean, default: false },
    recurrencePattern: { type: String },
    recurrenceDay: { type: String },
    recurrenceWeekOfMonth: { type: String },
    recurrenceEndDate: { type: String },
    recurrenceNote: { type: String },
    seriesId: { type: String },
    isSeriesTemplate: { type: Boolean, default: false },
    nextOccurrence: { type: String },
    lastTriggered: { type: String },
    mapUrl: { type: String },
    host: { type: String, required: true },
    targetCampuses: [{ type: String }],
    targetGroups: [{ type: String }],
    googlePhotosUrl: { type: String },
    formFields: [FormFieldSchema],
    isMultiDay: { type: Boolean, default: false },
    endDate: { type: String },
    schedule: { type: [EventScheduleDaySchema], default: [] },
    reminders: { type: [String], default: [] }, // Deprecated
    customReminders: {
      type: [{ daysBefore: Number, hoursBefore: Number, minutesBefore: Number }],
      default: []
    },
  },
  { timestamps: true }
);

const EventModel: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default EventModel;
