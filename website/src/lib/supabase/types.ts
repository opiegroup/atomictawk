export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'god' | 'admin' | 'sales' | 'user'
export type UserStatus = 'active' | 'warned' | 'suspended' | 'banned'
export type PageStatus = 'draft' | 'published'
export type ContentStatus = 'active' | 'hidden' | 'removed'
export type ReportStatus = 'open' | 'reviewing' | 'closed'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
export type MediaType = 'image' | 'video' | 'link'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          role: UserRole
          status: UserStatus
          created_at: string
          last_active_at: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          status?: UserStatus
          created_at?: string
          last_active_at?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          status?: UserStatus
          created_at?: string
          last_active_at?: string | null
        }
      }
      audit_log: {
        Row: {
          id: number
          actor_user_id: string | null
          action: string
          target_type: string | null
          target_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          actor_user_id?: string | null
          action: string
          target_type?: string | null
          target_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          actor_user_id?: string | null
          action?: string
          target_type?: string | null
          target_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          status: PageStatus
          published_at: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          status?: PageStatus
          published_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          status?: PageStatus
          published_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      page_versions: {
        Row: {
          id: string
          page_id: string
          version_number: number
          layout: Json
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          version_number: number
          layout: Json
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          version_number?: number
          layout?: Json
          created_by?: string | null
          created_at?: string
        }
      }
      community_uploads: {
        Row: {
          id: string
          user_id: string | null
          title: string | null
          caption: string | null
          media_type: MediaType
          media_url: string
          status: ContentStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title?: string | null
          caption?: string | null
          media_type: MediaType
          media_url: string
          status?: ContentStatus
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string | null
          caption?: string | null
          media_type?: MediaType
          media_url?: string
          status?: ContentStatus
          created_at?: string
        }
      }
      community_comments: {
        Row: {
          id: string
          upload_id: string
          user_id: string | null
          comment: string
          status: ContentStatus
          created_at: string
        }
        Insert: {
          id?: string
          upload_id: string
          user_id?: string | null
          comment: string
          status?: ContentStatus
          created_at?: string
        }
        Update: {
          id?: string
          upload_id?: string
          user_id?: string | null
          comment?: string
          status?: ContentStatus
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_user_id: string | null
          target_type: 'upload' | 'comment'
          target_id: string
          reason: string | null
          status: ReportStatus
          created_at: string
        }
        Insert: {
          id?: string
          reporter_user_id?: string | null
          target_type: 'upload' | 'comment'
          target_id: string
          reason?: string | null
          status?: ReportStatus
          created_at?: string
        }
        Update: {
          id?: string
          reporter_user_id?: string | null
          target_type?: 'upload' | 'comment'
          target_id?: string
          reason?: string | null
          status?: ReportStatus
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string | null
          email: string | null
          phone: string | null
          source: string | null
          message: string | null
          status: LeadStatus
          assigned_to: string | null
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          source?: string | null
          message?: string | null
          status?: LeadStatus
          assigned_to?: string | null
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          source?: string | null
          message?: string | null
          status?: LeadStatus
          assigned_to?: string | null
          tags?: string[]
          created_at?: string
        }
      }
      lead_notes: {
        Row: {
          id: string
          lead_id: string
          author_user_id: string | null
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          author_user_id?: string | null
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          author_user_id?: string | null
          note?: string
          created_at?: string
        }
      }
      support_sessions: {
        Row: {
          id: string
          god_user_id: string
          target_user_id: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          god_user_id: string
          target_user_id: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          god_user_id?: string
          target_user_id?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
      is_god: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_sales: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_user: {
        Args: Record<string, never>
        Returns: boolean
      }
      create_lead_from_public_form: {
        Args: {
          p_name: string
          p_email: string
          p_phone?: string
          p_source?: string
          p_message?: string
        }
        Returns: string
      }
      publish_page: {
        Args: { p_page_id: string }
        Returns: boolean
      }
      unpublish_page: {
        Args: { p_page_id: string }
        Returns: boolean
      }
      set_user_status: {
        Args: { p_user_id: string; p_status: string }
        Returns: boolean
      }
      set_user_role: {
        Args: { p_user_id: string; p_role: string }
        Returns: boolean
      }
      delete_user: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      create_support_session: {
        Args: { p_target_user_id: string }
        Returns: string
      }
      update_own_profile: {
        Args: { p_display_name?: string; p_avatar_url?: string }
        Returns: boolean
      }
      update_last_active: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_user_activity_stats: {
        Args: { p_user_id?: string }
        Returns: Json
      }
    }
  }
}

// Helper types for components
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Page = Database['public']['Tables']['pages']['Row']
export type PageVersion = Database['public']['Tables']['page_versions']['Row']
export type CommunityUpload = Database['public']['Tables']['community_uploads']['Row']
export type CommunityComment = Database['public']['Tables']['community_comments']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadNote = Database['public']['Tables']['lead_notes']['Row']
export type AuditLog = Database['public']['Tables']['audit_log']['Row']
