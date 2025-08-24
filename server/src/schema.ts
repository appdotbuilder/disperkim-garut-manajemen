import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  nik: z.string(),
  phone: z.string().nullable(),
  is_active: z.boolean(),
  role_id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable(),
  deleted_at: z.coerce.date().nullable()
});

export type User = z.infer<typeof userSchema>;

// Role schema
export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  permissions: z.record(z.string(), z.boolean()),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type Role = z.infer<typeof roleSchema>;

// Complaint schema
export const complaintStatusEnum = z.enum(['new', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected']);
export const complaintCategoryEnum = z.enum(['infrastruktur', 'kebersihan', 'keamanan', 'pelayanan', 'lainnya']);

export const complaintSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: complaintCategoryEnum,
  status: complaintStatusEnum,
  reporter_name: z.string(),
  reporter_email: z.string().email(),
  reporter_phone: z.string().nullable(),
  location: z.string().nullable(),
  coordinates: z.string().nullable(),
  photos: z.array(z.string()).nullable(),
  assigned_to: z.number().nullable(),
  admin_notes: z.string().nullable(),
  attachments: z.array(z.string()).nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable(),
  resolved_at: z.coerce.date().nullable()
});

export type Complaint = z.infer<typeof complaintSchema>;

// Infrastructure Report schema
export const infrastructureTypeEnum = z.enum(['jalan', 'jembatan', 'drainase', 'penerangan', 'taman', 'fasilitas_umum']);
export const severityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const infrastructureStatusEnum = z.enum(['new', 'verified', 'scheduled', 'in_progress', 'completed']);

export const infrastructureReportSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  infrastructure_type: infrastructureTypeEnum,
  severity: severityEnum,
  status: infrastructureStatusEnum,
  location: z.string().nullable(),
  coordinates: z.string().nullable(),
  estimated_cost: z.number().nullable(),
  actual_cost: z.number().nullable(),
  reporter_name: z.string(),
  reporter_email: z.string().email(),
  assigned_to: z.number().nullable(),
  scheduled_date: z.coerce.date().nullable(),
  completed_date: z.coerce.date().nullable(),
  photos: z.array(z.string()).nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type InfrastructureReport = z.infer<typeof infrastructureReportSchema>;

// News schema
export const newsSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  featured_image: z.string().nullable(),
  author_id: z.number(),
  is_published: z.boolean(),
  publish_date: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type News = z.infer<typeof newsSchema>;

// Announcement schema
export const announcementCategoryEnum = z.enum(['info', 'warning', 'urgent', 'maintenance']);

export const announcementSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  category: announcementCategoryEnum,
  link_url: z.string().nullable(),
  is_published: z.boolean(),
  publish_date: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type Announcement = z.infer<typeof announcementSchema>;

// Media schema
export const mediaSchema = z.object({
  id: z.number(),
  filename: z.string(),
  original_name: z.string(),
  mime_type: z.string(),
  size: z.number(),
  url: z.string(),
  owner_table: z.string().nullable(),
  owner_id: z.number().nullable(),
  uploaded_by: z.number(),
  created_at: z.coerce.date()
});

export type Media = z.infer<typeof mediaSchema>;

// Audit Log schema
export const auditActionEnum = z.enum(['create', 'update', 'delete', 'status_change', 'role_change', 'login', 'logout']);

export const auditLogSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  action: auditActionEnum,
  resource_type: z.string(),
  resource_id: z.number().nullable(),
  old_values: z.record(z.string(), z.any()).nullable(),
  new_values: z.record(z.string(), z.any()).nullable(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.coerce.date()
});

export type AuditLog = z.infer<typeof auditLogSchema>;

// Settings schema
export const settingSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string(),
  description: z.string().nullable(),
  is_public: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type Setting = z.infer<typeof settingSchema>;

// Status History schema (for tracking complaint and infrastructure report status changes)
export const statusHistorySchema = z.object({
  id: z.number(),
  resource_type: z.string(),
  resource_id: z.number(),
  old_status: z.string().nullable(),
  new_status: z.string(),
  notes: z.string().nullable(),
  changed_by: z.number(),
  created_at: z.coerce.date()
});

export type StatusHistory = z.infer<typeof statusHistorySchema>;

// Input schemas for creating/updating records
export const createUserInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  nik: z.string().length(16).regex(/^\d{16}$/, 'NIK must be 16 digits'),
  phone: z.string().nullable(),
  role_id: z.number(),
  is_active: z.boolean().default(true)
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  nik: z.string().length(16).regex(/^\d{16}$/, 'NIK must be 16 digits').optional(),
  phone: z.string().nullable().optional(),
  role_id: z.number().optional(),
  is_active: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const createComplaintInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  category: complaintCategoryEnum,
  reporter_name: z.string().min(1),
  reporter_email: z.string().email(),
  reporter_phone: z.string().nullable(),
  location: z.string().nullable(),
  coordinates: z.string().nullable(),
  photos: z.array(z.string()).nullable()
});

export type CreateComplaintInput = z.infer<typeof createComplaintInputSchema>;

export const updateComplaintInputSchema = z.object({
  id: z.number(),
  status: complaintStatusEnum.optional(),
  assigned_to: z.number().nullable().optional(),
  admin_notes: z.string().nullable().optional()
});

export type UpdateComplaintInput = z.infer<typeof updateComplaintInputSchema>;

export const createInfrastructureReportInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  infrastructure_type: infrastructureTypeEnum,
  severity: severityEnum,
  location: z.string().nullable(),
  coordinates: z.string().nullable(),
  estimated_cost: z.number().nullable(),
  reporter_name: z.string().min(1),
  reporter_email: z.string().email(),
  photos: z.array(z.string()).nullable()
});

export type CreateInfrastructureReportInput = z.infer<typeof createInfrastructureReportInputSchema>;

export const updateInfrastructureReportInputSchema = z.object({
  id: z.number(),
  status: infrastructureStatusEnum.optional(),
  assigned_to: z.number().nullable().optional(),
  scheduled_date: z.coerce.date().nullable().optional(),
  actual_cost: z.number().nullable().optional()
});

export type UpdateInfrastructureReportInput = z.infer<typeof updateInfrastructureReportInputSchema>;

export const createNewsInputSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(50),
  excerpt: z.string().nullable(),
  featured_image: z.string().nullable(),
  author_id: z.number(),
  is_published: z.boolean().default(false),
  publish_date: z.coerce.date().nullable()
});

export type CreateNewsInput = z.infer<typeof createNewsInputSchema>;

export const updateNewsInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().min(50).optional(),
  excerpt: z.string().nullable().optional(),
  featured_image: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
  publish_date: z.coerce.date().nullable().optional()
});

export type UpdateNewsInput = z.infer<typeof updateNewsInputSchema>;

export const createAnnouncementInputSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: announcementCategoryEnum,
  link_url: z.string().nullable(),
  is_published: z.boolean().default(false),
  publish_date: z.coerce.date().nullable()
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementInputSchema>;

export const updateAnnouncementInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: announcementCategoryEnum.optional(),
  link_url: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
  publish_date: z.coerce.date().nullable().optional()
});

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementInputSchema>;

export const createRoleInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  permissions: z.record(z.string(), z.boolean())
});

export type CreateRoleInput = z.infer<typeof createRoleInputSchema>;

export const updateRoleInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  permissions: z.record(z.string(), z.boolean()).optional()
});

export type UpdateRoleInput = z.infer<typeof updateRoleInputSchema>;

// Query parameters schemas for filtering and pagination
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const userFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
  role_id: z.number().optional(),
  is_active: z.boolean().optional()
});

export type UserFilterInput = z.infer<typeof userFilterSchema>;

export const complaintFilterSchema = paginationSchema.extend({
  status: complaintStatusEnum.optional(),
  category: complaintCategoryEnum.optional(),
  assigned_to: z.number().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  search: z.string().optional()
});

export type ComplaintFilterInput = z.infer<typeof complaintFilterSchema>;

export const infrastructureReportFilterSchema = paginationSchema.extend({
  status: infrastructureStatusEnum.optional(),
  infrastructure_type: infrastructureTypeEnum.optional(),
  severity: severityEnum.optional(),
  assigned_to: z.number().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  search: z.string().optional()
});

export type InfrastructureReportFilterInput = z.infer<typeof infrastructureReportFilterSchema>;