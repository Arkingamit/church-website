export type UserRole = 'member' | 'campus_leader' | 'admin' | 'super_admin';
export type MemberStatus = 'pending' | 'approved' | 'rejected';

export type FormFieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date';

export interface FormFieldOption {
  id: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: FormFieldOption[]; // for radio, checkbox, select
}
