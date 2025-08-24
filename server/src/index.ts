import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import all schemas
import {
  createUserInputSchema,
  updateUserInputSchema,
  userFilterSchema,
  createRoleInputSchema,
  updateRoleInputSchema,
  createComplaintInputSchema,
  updateComplaintInputSchema,
  complaintFilterSchema,
  createInfrastructureReportInputSchema,
  updateInfrastructureReportInputSchema,
  infrastructureReportFilterSchema,
  createNewsInputSchema,
  updateNewsInputSchema,
  paginationSchema,
  createAnnouncementInputSchema,
  updateAnnouncementInputSchema
} from './schema';

// Import all handlers
import { 
  createUser, 
  updateUser, 
  getUsers, 
  getUserById, 
  softDeleteUser, 
  activateUser 
} from './handlers/users';
import { 
  createRole, 
  updateRole, 
  getRoles, 
  getRoleById, 
  deleteRole, 
  checkPermission 
} from './handlers/roles';
import { 
  createComplaint, 
  updateComplaintStatus, 
  getComplaints, 
  getComplaintById, 
  getComplaintStatusHistory, 
  assignComplaint 
} from './handlers/complaints';
import { 
  createInfrastructureReport, 
  updateInfrastructureReport, 
  getInfrastructureReports, 
  getInfrastructureReportById, 
  scheduleInfrastructureWork, 
  completeInfrastructureWork 
} from './handlers/infrastructure_reports';
import { 
  createNews, 
  updateNews, 
  getPublishedNews, 
  getAllNews, 
  getNewsById, 
  deleteNews, 
  publishNews 
} from './handlers/news';
import { 
  createAnnouncement, 
  updateAnnouncement, 
  getPublishedAnnouncements, 
  getAllAnnouncements, 
  getAnnouncementById, 
  deleteAnnouncement, 
  publishAnnouncement, 
  getAnnouncementsByCategory 
} from './handlers/announcements';
import { 
  uploadMedia, 
  uploadMultipleMedia, 
  getMediaByOwner, 
  getMediaById, 
  deleteMedia, 
  getUnassignedMedia, 
  assignMediaToOwner, 
  cleanupOrphanedMedia 
} from './handlers/media';
import { 
  createAuditLog, 
  getAuditLogs, 
  getAuditLogsByResource, 
  getUserActivityLogs, 
  getLoginHistory, 
  deleteOldAuditLogs, 
  exportAuditLogs 
} from './handlers/audit_logs';
import { 
  getSetting, 
  getPublicSettings, 
  getAllSettings, 
  updateSetting, 
  createSetting, 
  deleteSetting, 
  getSettingValue, 
  updateMultipleSettings, 
  initializeDefaultSettings 
} from './handlers/settings';
import { 
  getDashboardStats, 
  getUserDashboardStats, 
  getItemsRequiringAttention, 
  getPerformanceMetrics 
} from './handlers/dashboard';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Dashboard routes
  getDashboardStats: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getDashboardStats(input.userId)),
  
  getUserDashboardStats: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getUserDashboardStats(input.userId)),
  
  getItemsRequiringAttention: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getItemsRequiringAttention(input.userId)),
  
  getPerformanceMetrics: publicProcedure
    .input(z.object({ 
      dateFrom: z.coerce.date(), 
      dateTo: z.coerce.date() 
    }))
    .query(({ input }) => getPerformanceMetrics(input.dateFrom, input.dateTo)),

  // User management routes
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),
  
  getUsers: publicProcedure
    .input(userFilterSchema)
    .query(({ input }) => getUsers(input)),
  
  getUserById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getUserById(input.id)),
  
  softDeleteUser: publicProcedure
    .input(z.object({ id: z.number(), deletedBy: z.number() }))
    .mutation(({ input }) => softDeleteUser(input.id, input.deletedBy)),
  
  activateUser: publicProcedure
    .input(z.object({ id: z.number(), activatedBy: z.number() }))
    .mutation(({ input }) => activateUser(input.id, input.activatedBy)),

  // Role management routes
  createRole: publicProcedure
    .input(createRoleInputSchema)
    .mutation(({ input }) => createRole(input)),
  
  updateRole: publicProcedure
    .input(updateRoleInputSchema)
    .mutation(({ input }) => updateRole(input)),
  
  getRoles: publicProcedure
    .query(() => getRoles()),
  
  getRoleById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getRoleById(input.id)),
  
  deleteRole: publicProcedure
    .input(z.object({ id: z.number(), deletedBy: z.number() }))
    .mutation(({ input }) => deleteRole(input.id, input.deletedBy)),
  
  checkPermission: publicProcedure
    .input(z.object({ userId: z.number(), permission: z.string() }))
    .query(({ input }) => checkPermission(input.userId, input.permission)),

  // Complaint management routes
  createComplaint: publicProcedure
    .input(createComplaintInputSchema)
    .mutation(({ input }) => createComplaint(input)),
  
  updateComplaintStatus: publicProcedure
    .input(updateComplaintInputSchema.extend({ updatedBy: z.number() }))
    .mutation(({ input }) => {
      const { updatedBy, ...complaintInput } = input;
      return updateComplaintStatus(complaintInput, updatedBy);
    }),
  
  getComplaints: publicProcedure
    .input(complaintFilterSchema)
    .query(({ input }) => getComplaints(input)),
  
  getComplaintById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getComplaintById(input.id)),
  
  getComplaintStatusHistory: publicProcedure
    .input(z.object({ complaintId: z.number() }))
    .query(({ input }) => getComplaintStatusHistory(input.complaintId)),
  
  assignComplaint: publicProcedure
    .input(z.object({ 
      complaintId: z.number(), 
      assignedTo: z.number(), 
      assignedBy: z.number() 
    }))
    .mutation(({ input }) => assignComplaint(input.complaintId, input.assignedTo, input.assignedBy)),

  // Infrastructure report routes
  createInfrastructureReport: publicProcedure
    .input(createInfrastructureReportInputSchema)
    .mutation(({ input }) => createInfrastructureReport(input)),
  
  updateInfrastructureReport: publicProcedure
    .input(updateInfrastructureReportInputSchema.extend({ updatedBy: z.number() }))
    .mutation(({ input }) => {
      const { updatedBy, ...reportInput } = input;
      return updateInfrastructureReport(reportInput, updatedBy);
    }),
  
  getInfrastructureReports: publicProcedure
    .input(infrastructureReportFilterSchema)
    .query(({ input }) => getInfrastructureReports(input)),
  
  getInfrastructureReportById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getInfrastructureReportById(input.id)),
  
  scheduleInfrastructureWork: publicProcedure
    .input(z.object({ 
      reportId: z.number(), 
      scheduledDate: z.coerce.date(), 
      scheduledBy: z.number() 
    }))
    .mutation(({ input }) => scheduleInfrastructureWork(input.reportId, input.scheduledDate, input.scheduledBy)),
  
  completeInfrastructureWork: publicProcedure
    .input(z.object({ 
      reportId: z.number(), 
      actualCost: z.number().nullable(), 
      completedBy: z.number() 
    }))
    .mutation(({ input }) => completeInfrastructureWork(input.reportId, input.actualCost, input.completedBy)),

  // News management routes
  createNews: publicProcedure
    .input(createNewsInputSchema)
    .mutation(({ input }) => createNews(input)),
  
  updateNews: publicProcedure
    .input(updateNewsInputSchema.extend({ updatedBy: z.number() }))
    .mutation(({ input }) => {
      const { updatedBy, ...newsInput } = input;
      return updateNews(newsInput, updatedBy);
    }),
  
  getPublishedNews: publicProcedure
    .input(paginationSchema)
    .query(({ input }) => getPublishedNews(input)),
  
  getAllNews: publicProcedure
    .input(paginationSchema.extend({ authorId: z.number().optional() }))
    .query(({ input }) => getAllNews(input, input.authorId)),
  
  getNewsById: publicProcedure
    .input(z.object({ id: z.number(), includeUnpublished: z.boolean().default(false) }))
    .query(({ input }) => getNewsById(input.id, input.includeUnpublished)),
  
  deleteNews: publicProcedure
    .input(z.object({ id: z.number(), deletedBy: z.number() }))
    .mutation(({ input }) => deleteNews(input.id, input.deletedBy)),
  
  publishNews: publicProcedure
    .input(z.object({ id: z.number(), publishedBy: z.number() }))
    .mutation(({ input }) => publishNews(input.id, input.publishedBy)),

  // Announcement routes
  createAnnouncement: publicProcedure
    .input(createAnnouncementInputSchema)
    .mutation(({ input }) => createAnnouncement(input)),
  
  updateAnnouncement: publicProcedure
    .input(updateAnnouncementInputSchema)
    .mutation(({ input }) => updateAnnouncement(input)),
  
  getPublishedAnnouncements: publicProcedure
    .input(paginationSchema)
    .query(({ input }) => getPublishedAnnouncements(input)),
  
  getAllAnnouncements: publicProcedure
    .input(paginationSchema)
    .query(({ input }) => getAllAnnouncements(input)),
  
  getAnnouncementById: publicProcedure
    .input(z.object({ id: z.number(), includeUnpublished: z.boolean().default(false) }))
    .query(({ input }) => getAnnouncementById(input.id, input.includeUnpublished)),
  
  deleteAnnouncement: publicProcedure
    .input(z.object({ id: z.number(), deletedBy: z.number() }))
    .mutation(({ input }) => deleteAnnouncement(input.id, input.deletedBy)),
  
  publishAnnouncement: publicProcedure
    .input(z.object({ id: z.number(), publishedBy: z.number() }))
    .mutation(({ input }) => publishAnnouncement(input.id, input.publishedBy)),
  
  getAnnouncementsByCategory: publicProcedure
    .input(z.object({ category: z.string(), ...paginationSchema.shape }))
    .query(({ input }) => {
      const { category, ...pagination } = input;
      return getAnnouncementsByCategory(category, pagination);
    }),

  // Media management routes
  getMediaByOwner: publicProcedure
    .input(z.object({ ownerTable: z.string(), ownerId: z.number() }))
    .query(({ input }) => getMediaByOwner(input.ownerTable, input.ownerId)),
  
  getMediaById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getMediaById(input.id)),
  
  deleteMedia: publicProcedure
    .input(z.object({ id: z.number(), deletedBy: z.number() }))
    .mutation(({ input }) => deleteMedia(input.id, input.deletedBy)),
  
  getUnassignedMedia: publicProcedure
    .input(z.object({ uploadedBy: z.number().optional() }))
    .query(({ input }) => getUnassignedMedia(input.uploadedBy)),
  
  assignMediaToOwner: publicProcedure
    .input(z.object({ 
      mediaId: z.number(), 
      ownerTable: z.string(), 
      ownerId: z.number() 
    }))
    .mutation(({ input }) => assignMediaToOwner(input.mediaId, input.ownerTable, input.ownerId)),
  
  cleanupOrphanedMedia: publicProcedure
    .mutation(() => cleanupOrphanedMedia()),

  // Audit log routes
  getAuditLogs: publicProcedure
    .input(paginationSchema.extend({
      userId: z.number().optional(),
      action: z.string().optional(),
      resourceType: z.string().optional(),
      resourceId: z.number().optional(),
      dateFrom: z.coerce.date().optional(),
      dateTo: z.coerce.date().optional()
    }))
    .query(({ input }) => {
      const { page, limit, ...filters } = input;
      return getAuditLogs({ page, limit }, filters);
    }),
  
  getAuditLogsByResource: publicProcedure
    .input(z.object({
      resourceType: z.string(),
      resourceId: z.number(),
      ...paginationSchema.shape
    }))
    .query(({ input }) => {
      const { resourceType, resourceId, page, limit } = input;
      return getAuditLogsByResource(resourceType, resourceId, { page, limit });
    }),
  
  getUserActivityLogs: publicProcedure
    .input(z.object({
      userId: z.number(),
      dateFrom: z.coerce.date().optional(),
      dateTo: z.coerce.date().optional(),
      ...paginationSchema.shape
    }))
    .query(({ input }) => {
      const { userId, dateFrom, dateTo, page, limit } = input;
      return getUserActivityLogs(userId, { page, limit }, dateFrom, dateTo);
    }),
  
  getLoginHistory: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      ...paginationSchema.shape
    }).partial())
    .query(({ input }) => {
      const { userId, page, limit } = input;
      return getLoginHistory(userId, page && limit ? { page, limit } : undefined);
    }),
  
  exportAuditLogs: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      action: z.string().optional(),
      resourceType: z.string().optional(),
      dateFrom: z.coerce.date().optional(),
      dateTo: z.coerce.date().optional(),
      format: z.enum(['csv', 'json']).default('csv')
    }))
    .query(({ input }) => {
      const { format, ...filters } = input;
      return exportAuditLogs(filters, format);
    }),

  // Settings routes
  getSetting: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(({ input }) => getSetting(input.key)),
  
  getPublicSettings: publicProcedure
    .query(() => getPublicSettings()),
  
  getAllSettings: publicProcedure
    .query(() => getAllSettings()),
  
  updateSetting: publicProcedure
    .input(z.object({ 
      key: z.string(), 
      value: z.string(), 
      updatedBy: z.number() 
    }))
    .mutation(({ input }) => updateSetting(input.key, input.value, input.updatedBy)),
  
  createSetting: publicProcedure
    .input(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().nullable(),
      isPublic: z.boolean(),
      createdBy: z.number()
    }))
    .mutation(({ input }) => createSetting(input.key, input.value, input.description, input.isPublic, input.createdBy)),
  
  deleteSetting: publicProcedure
    .input(z.object({ key: z.string(), deletedBy: z.number() }))
    .mutation(({ input }) => deleteSetting(input.key, input.deletedBy)),
  
  updateMultipleSettings: publicProcedure
    .input(z.object({
      settings: z.array(z.object({ key: z.string(), value: z.string() })),
      updatedBy: z.number()
    }))
    .mutation(({ input }) => updateMultipleSettings(input.settings, input.updatedBy)),
  
  initializeDefaultSettings: publicProcedure
    .mutation(() => initializeDefaultSettings())
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();