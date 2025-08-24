import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  numeric, 
  integer, 
  boolean,
  jsonb,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const complaintStatusEnum = pgEnum('complaint_status', ['new', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected']);
export const complaintCategoryEnum = pgEnum('complaint_category', ['infrastruktur', 'kebersihan', 'keamanan', 'pelayanan', 'lainnya']);
export const infrastructureTypeEnum = pgEnum('infrastructure_type', ['jalan', 'jembatan', 'drainase', 'penerangan', 'taman', 'fasilitas_umum']);
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);
export const infrastructureStatusEnum = pgEnum('infrastructure_status', ['new', 'verified', 'scheduled', 'in_progress', 'completed']);
export const announcementCategoryEnum = pgEnum('announcement_category', ['info', 'warning', 'urgent', 'maintenance']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'status_change', 'role_change', 'login', 'logout']);

// Tables
export const rolesTable = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  permissions: jsonb('permissions').notNull().$type<Record<string, boolean>>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  nik: text('nik').notNull().unique(),
  phone: text('phone'),
  is_active: boolean('is_active').default(true).notNull(),
  role_id: integer('role_id').references(() => rolesTable.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at'),
  deleted_at: timestamp('deleted_at')
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  nikIdx: index('users_nik_idx').on(table.nik),
  roleIdx: index('users_role_idx').on(table.role_id),
  deletedAtIdx: index('users_deleted_at_idx').on(table.deleted_at)
}));

export const complaintsTable = pgTable('complaints', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: complaintCategoryEnum('category').notNull(),
  status: complaintStatusEnum('status').default('new').notNull(),
  reporter_name: text('reporter_name').notNull(),
  reporter_email: text('reporter_email').notNull(),
  reporter_phone: text('reporter_phone'),
  location: text('location'),
  coordinates: text('coordinates'),
  photos: jsonb('photos').$type<string[]>(),
  assigned_to: integer('assigned_to').references(() => usersTable.id),
  admin_notes: text('admin_notes'),
  attachments: jsonb('attachments').$type<string[]>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at'),
  resolved_at: timestamp('resolved_at')
}, (table) => ({
  statusIdx: index('complaints_status_idx').on(table.status),
  categoryIdx: index('complaints_category_idx').on(table.category),
  assignedToIdx: index('complaints_assigned_to_idx').on(table.assigned_to),
  createdAtIdx: index('complaints_created_at_idx').on(table.created_at)
}));

export const infrastructureReportsTable = pgTable('infrastructure_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  infrastructure_type: infrastructureTypeEnum('infrastructure_type').notNull(),
  severity: severityEnum('severity').notNull(),
  status: infrastructureStatusEnum('status').default('new').notNull(),
  location: text('location'),
  coordinates: text('coordinates'),
  estimated_cost: numeric('estimated_cost', { precision: 15, scale: 2 }),
  actual_cost: numeric('actual_cost', { precision: 15, scale: 2 }),
  reporter_name: text('reporter_name').notNull(),
  reporter_email: text('reporter_email').notNull(),
  assigned_to: integer('assigned_to').references(() => usersTable.id),
  scheduled_date: timestamp('scheduled_date'),
  completed_date: timestamp('completed_date'),
  photos: jsonb('photos').$type<string[]>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
}, (table) => ({
  statusIdx: index('infrastructure_reports_status_idx').on(table.status),
  typeIdx: index('infrastructure_reports_type_idx').on(table.infrastructure_type),
  severityIdx: index('infrastructure_reports_severity_idx').on(table.severity),
  assignedToIdx: index('infrastructure_reports_assigned_to_idx').on(table.assigned_to)
}));

export const newsTable = pgTable('news', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  featured_image: text('featured_image'),
  author_id: integer('author_id').references(() => usersTable.id).notNull(),
  is_published: boolean('is_published').default(false).notNull(),
  publish_date: timestamp('publish_date'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
}, (table) => ({
  publishedIdx: index('news_published_idx').on(table.is_published),
  publishDateIdx: index('news_publish_date_idx').on(table.publish_date),
  authorIdx: index('news_author_idx').on(table.author_id)
}));

export const announcementsTable = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: announcementCategoryEnum('category').notNull(),
  link_url: text('link_url'),
  is_published: boolean('is_published').default(false).notNull(),
  publish_date: timestamp('publish_date'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
}, (table) => ({
  publishedIdx: index('announcements_published_idx').on(table.is_published),
  categoryIdx: index('announcements_category_idx').on(table.category),
  publishDateIdx: index('announcements_publish_date_idx').on(table.publish_date)
}));

export const mediaTable = pgTable('media', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  original_name: text('original_name').notNull(),
  mime_type: text('mime_type').notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  owner_table: text('owner_table'),
  owner_id: integer('owner_id'),
  uploaded_by: integer('uploaded_by').references(() => usersTable.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  ownerIdx: index('media_owner_idx').on(table.owner_table, table.owner_id),
  uploadedByIdx: index('media_uploaded_by_idx').on(table.uploaded_by)
}));

export const auditLogsTable = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => usersTable.id).notNull(),
  action: auditActionEnum('action').notNull(),
  resource_type: text('resource_type').notNull(),
  resource_id: integer('resource_id'),
  old_values: jsonb('old_values').$type<Record<string, any>>(),
  new_values: jsonb('new_values').$type<Record<string, any>>(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  userIdx: index('audit_logs_user_idx').on(table.user_id),
  actionIdx: index('audit_logs_action_idx').on(table.action),
  resourceIdx: index('audit_logs_resource_idx').on(table.resource_type, table.resource_id),
  createdAtIdx: index('audit_logs_created_at_idx').on(table.created_at)
}));

export const settingsTable = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  is_public: boolean('is_public').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
}, (table) => ({
  keyIdx: index('settings_key_idx').on(table.key),
  publicIdx: index('settings_public_idx').on(table.is_public)
}));

export const statusHistoryTable = pgTable('status_history', {
  id: serial('id').primaryKey(),
  resource_type: text('resource_type').notNull(),
  resource_id: integer('resource_id').notNull(),
  old_status: text('old_status'),
  new_status: text('new_status').notNull(),
  notes: text('notes'),
  changed_by: integer('changed_by').references(() => usersTable.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  resourceIdx: index('status_history_resource_idx').on(table.resource_type, table.resource_id),
  changedByIdx: index('status_history_changed_by_idx').on(table.changed_by),
  createdAtIdx: index('status_history_created_at_idx').on(table.created_at)
}));

// Relations
export const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable)
}));

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  role: one(rolesTable, {
    fields: [usersTable.role_id],
    references: [rolesTable.id]
  }),
  complaints: many(complaintsTable),
  infrastructureReports: many(infrastructureReportsTable),
  news: many(newsTable),
  media: many(mediaTable),
  auditLogs: many(auditLogsTable),
  statusHistory: many(statusHistoryTable)
}));

export const complaintsRelations = relations(complaintsTable, ({ one }) => ({
  assignedTo: one(usersTable, {
    fields: [complaintsTable.assigned_to],
    references: [usersTable.id]
  })
}));

export const infrastructureReportsRelations = relations(infrastructureReportsTable, ({ one }) => ({
  assignedTo: one(usersTable, {
    fields: [infrastructureReportsTable.assigned_to],
    references: [usersTable.id]
  })
}));

export const newsRelations = relations(newsTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [newsTable.author_id],
    references: [usersTable.id]
  })
}));

export const mediaRelations = relations(mediaTable, ({ one }) => ({
  uploadedBy: one(usersTable, {
    fields: [mediaTable.uploaded_by],
    references: [usersTable.id]
  })
}));

export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [auditLogsTable.user_id],
    references: [usersTable.id]
  })
}));

export const statusHistoryRelations = relations(statusHistoryTable, ({ one }) => ({
  changedBy: one(usersTable, {
    fields: [statusHistoryTable.changed_by],
    references: [usersTable.id]
  })
}));

// TypeScript types for the tables
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Role = typeof rolesTable.$inferSelect;
export type NewRole = typeof rolesTable.$inferInsert;
export type Complaint = typeof complaintsTable.$inferSelect;
export type NewComplaint = typeof complaintsTable.$inferInsert;
export type InfrastructureReport = typeof infrastructureReportsTable.$inferSelect;
export type NewInfrastructureReport = typeof infrastructureReportsTable.$inferInsert;
export type News = typeof newsTable.$inferSelect;
export type NewNews = typeof newsTable.$inferInsert;
export type Announcement = typeof announcementsTable.$inferSelect;
export type NewAnnouncement = typeof announcementsTable.$inferInsert;
export type Media = typeof mediaTable.$inferSelect;
export type NewMedia = typeof mediaTable.$inferInsert;
export type AuditLog = typeof auditLogsTable.$inferSelect;
export type NewAuditLog = typeof auditLogsTable.$inferInsert;
export type Setting = typeof settingsTable.$inferSelect;
export type NewSetting = typeof settingsTable.$inferInsert;
export type StatusHistory = typeof statusHistoryTable.$inferSelect;
export type NewStatusHistory = typeof statusHistoryTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  roles: rolesTable,
  users: usersTable,
  complaints: complaintsTable,
  infrastructureReports: infrastructureReportsTable,
  news: newsTable,
  announcements: announcementsTable,
  media: mediaTable,
  auditLogs: auditLogsTable,
  settings: settingsTable,
  statusHistory: statusHistoryTable
};