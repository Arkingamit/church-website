export type UserRole = 'member' | 'campus_leader' | 'admin' | 'super_admin';
export type MemberStatus = 'pending' | 'approved' | 'rejected';

export type FormFieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date';

export interface FormFieldOption {
  id: string;
  label: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  recurring: boolean;
  recurrencePattern?: 'weekly' | 'biweekly' | 'monthly' | 'custom' | 'custom_monthly';
  recurrenceDay?: string;
  recurrenceWeekOfMonth?: string; // '1st', '2nd', '3rd', '4th', 'last'
  recurrenceEndDate?: string;
  recurrenceNote?: string;
  seriesId?: string;
  isSeriesTemplate?: boolean;
  nextOccurrence?: string;
  reminders?: string[]; // Deprecated, keeping for backwards compatibility
  customReminders?: { daysBefore: number; time: string; }[];
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: FormFieldOption[]; // for radio, checkbox, select
}
