import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(100),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  role: z.enum(['admin', 'staff']).default('admin'),
});

// Golf Course validation schemas
export const golfCourseSchema = z.object({
  name: z.string().min(1, 'Golf course name is required').max(100),
  address: z.string().max(255).optional().default(''),
  city: z.string().max(100).optional().default(''),
  state: z.string().max(50).optional().default(''),
  zip: z.string().max(10).optional().default(''),
  phone: z.string().max(20).optional().default(''),
  website: z.string().url('Invalid website URL').or(z.literal('')).optional().default(''),
  taxRate: z.number().min(0).max(1).default(0.06),
  discountRate: z.number().min(0).max(1).default(0.1),
  leadDiscountRate: z.number().min(0).max(1).default(0.3),
});

export const updateGolfCourseSchema = golfCourseSchema.partial();

// Golf Course User validation schemas
export const golfCourseUserSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  email: z.string().email('Invalid email address').max(255).optional().default(''),
  firstName: z.string().max(50).optional().default(''),
  lastName: z.string().max(50).optional().default(''),
  role: z.enum(['ADMIN', 'STAFF']).default('STAFF'),
  golfCourseId: z.number().int().positive(),
});

export const updateGolfCourseUserSchema = golfCourseUserSchema.partial().omit({ golfCourseId: true });

// Booking validation schemas
export const bookingDetailSchema = z.object({
  teeTime: z.string().datetime('Invalid date format'),
  playerNames: z.string().max(500).optional().default(''),
  numberOfPlayers: z.number().int().min(1).max(4).default(1),
  cart: z.boolean().default(true),
  holes: z.union([z.literal(9), z.literal(18)]).default(18),
  playerType: z.enum(['adult', 'senior', 'junior', 'child']).default('adult'),
  rateType: z.enum(['cart', 'walking']).default('cart'),
});

export const bookingSchema = z.object({
  phone: z.string().max(20).optional().default(''),
  email: z.string().email('Invalid email address').max(255).optional().default(''),
  firstName: z.string().max(50).optional().default(''),
  lastName: z.string().max(50).optional().default(''),
  golfCourseId: z.number().int().positive(),
  bookingDetails: z.array(bookingDetailSchema).min(1, 'At least one booking detail is required'),
});

// Check-in validation schemas
export const checkInOrderSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').max(100),
  customerPhone: z.string().max(20).optional().default(''),
  golfCourseId: z.number().int().positive(),
  details: z.array(z.object({
    teeTime: z.string().datetime('Invalid date format'),
    playerName: z.string().max(100).optional().default(''),
    holes: z.union([z.literal(9), z.literal(18)]).default(18),
    playerType: z.enum(['adult', 'senior', 'junior', 'child']).default('adult'),
    rateType: z.enum(['cart', 'walking']).default('cart'),
  })).min(1, 'At least one detail is required'),
});

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('10'),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
});

// Export types for TypeScript
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type GolfCourseInput = z.infer<typeof golfCourseSchema>;
export type UpdateGolfCourseInput = z.infer<typeof updateGolfCourseSchema>;
export type GolfCourseUserInput = z.infer<typeof golfCourseUserSchema>;
export type UpdateGolfCourseUserInput = z.infer<typeof updateGolfCourseUserSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type CheckInOrderInput = z.infer<typeof checkInOrderSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type IdParam = z.infer<typeof idParamSchema>; 