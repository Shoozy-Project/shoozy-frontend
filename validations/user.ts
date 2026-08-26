import { z } from 'zod';

export const TUNISIAN_GOVERNORATES = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Medenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kebili',
] as const;

export const editUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Must be a valid email address'),
  phone: z.string().max(32).nullable().optional(),
  governorate: z.string().min(1, 'Governorate is required'),
  role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'], {
    required_error: 'Please select a role',
  }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
    required_error: 'Please select a status',
  }),
});

export type EditUserFormInput = z.infer<typeof editUserSchema>;
