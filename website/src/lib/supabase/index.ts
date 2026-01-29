// Client-side exports only
// For server-side, import directly from './server'

export { createClient, getSupabaseClient } from './client'

// Hooks (client-side only)
export { useUser, useRole, useAuth } from './hooks'

// Types
export type {
  Database,
  Profile,
  Page,
  PageVersion,
  CommunityUpload,
  CommunityComment,
  Report,
  Lead,
  LeadNote,
  AuditLog,
  UserRole,
  UserStatus,
  PageStatus,
  ContentStatus,
  ReportStatus,
  LeadStatus,
  MediaType,
} from './types'
