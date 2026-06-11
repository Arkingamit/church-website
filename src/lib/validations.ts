import { z } from 'zod';

// Authentication Schemas
export const loginSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

export const registerSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
  firstName: z.string().min(2, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name is required'),
  gender: z.enum(['male', 'female']),
  birthday: z.string().optional(),
  maritalStatus: z.enum(['single', 'married']).optional(),
  marriageDate: z.string().optional(),
  campusId: z.string().min(1, 'Campus is required'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  familyMemberId: z.string().optional(),
});

// Event Schema
export const eventSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  time: z.string(),
  endTime: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  category: z.string(),
  capacity: z.number().int().positive(),
  recurring: z.boolean().optional(),
  host: z.string().optional(),
  targetCampuses: z.array(z.string()),
  targetGroups: z.array(z.string()),
  googlePhotosUrl: z.string().url().optional().or(z.literal('')),
  formFields: z.array(z.any()).optional(),
});

// User Admin Schema (for creating/updating users in admin)
export const userSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'campus_leader', 'admin', 'super_admin']),
  status: z.enum(['pending', 'approved', 'rejected']),
  campusId: z.string(),
  groups: z.array(z.string()).optional(),
});
