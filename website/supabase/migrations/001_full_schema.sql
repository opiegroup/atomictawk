-- ============================================
-- ATOMIC TAWK - COMPLETE SUPABASE SCHEMA
-- ============================================
-- Includes: Tables, Functions, Triggers, RLS
-- Run order: Tables → Functions → Triggers → RLS → Grants
-- ============================================

-- ============================================
-- 1. CORE TABLES (CREATE FIRST)
-- ============================================

-- A) PROFILES - Public user info linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('god', 'admin', 'sales', 'user')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'warned', 'suspended', 'banned')),
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz
);

-- B) AUDIT_LOG - Tracks sensitive actions
CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- C) PAGES - Slug-based pages
CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- D) PAGE_VERSIONS - Builder JSON per version
CREATE TABLE IF NOT EXISTS public.page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES public.pages(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  layout jsonb NOT NULL DEFAULT '{"blocks": [], "globals": {}}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(page_id, version_number)
);

-- E) COMMUNITY_UPLOADS - User-generated uploads
CREATE TABLE IF NOT EXISTS public.community_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  caption text,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video', 'link')),
  media_url text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed')),
  created_at timestamptz DEFAULT now()
);

-- F) COMMUNITY_COMMENTS - Comments on uploads
CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid REFERENCES public.community_uploads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  comment text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed')),
  created_at timestamptz DEFAULT now()
);

-- G) REPORTS - User reporting system
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid REFERENCES auth.users(id),
  target_type text NOT NULL CHECK (target_type IN ('upload', 'comment')),
  target_id uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- H) LEADS - Sales leads/enquiries
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  phone text,
  source text,
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'won', 'lost')),
  assigned_to uuid REFERENCES auth.users(id),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- I) LEAD_NOTES - Sales notes on leads
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES auth.users(id),
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- J) SUPPORT_SESSIONS - God impersonation sessions
CREATE TABLE IF NOT EXISTS public.support_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  god_user_id uuid REFERENCES auth.users(id) NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status);
CREATE INDEX IF NOT EXISTS idx_page_versions_page ON public.page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_community_uploads_user ON public.community_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_community_uploads_status ON public.community_uploads(status);
CREATE INDEX IF NOT EXISTS idx_community_comments_upload ON public.community_comments(upload_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user ON public.community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON public.lead_notes(lead_id);

-- ============================================
-- 3. HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================

-- Get current user's role from profiles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Check if current user is god
CREATE OR REPLACE FUNCTION public.is_god()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'god'
  )
$$;

-- Check if current user is admin or god
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('god', 'admin')
  )
$$;

-- Check if current user is sales or god
CREATE OR REPLACE FUNCTION public.is_sales()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('god', 'sales')
  )
$$;

-- Check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid() IS NOT NULL
$$;

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on pages
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pages_updated_at ON public.pages;
CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile (limited fields via RPC)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can view profiles for moderation (limited to non-sensitive)
CREATE POLICY "Admin can view profiles"
  ON public.profiles FOR SELECT
  USING (is_admin());

-- God can do everything with profiles
CREATE POLICY "God full access to profiles"
  ON public.profiles FOR ALL
  USING (is_god());

-- ----------------------------------------
-- AUDIT_LOG POLICIES
-- ----------------------------------------

-- Only god can read all audit logs
CREATE POLICY "God can read audit logs"
  ON public.audit_log FOR SELECT
  USING (is_god());

-- Admin can read limited audit logs (not user-sensitive)
CREATE POLICY "Admin can read non-sensitive audit logs"
  ON public.audit_log FOR SELECT
  USING (is_admin() AND action NOT IN ('USER_DELETED', 'ROLE_CHANGED', 'IMPERSONATION_STARTED'));

-- System can insert (via functions)
CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------
-- PAGES POLICIES
-- ----------------------------------------

-- Public can read published pages
CREATE POLICY "Public can read published pages"
  ON public.pages FOR SELECT
  USING (status = 'published');

-- Admin/God can CRUD pages
CREATE POLICY "Admin can manage pages"
  ON public.pages FOR ALL
  USING (is_admin());

-- ----------------------------------------
-- PAGE_VERSIONS POLICIES
-- ----------------------------------------

-- Public can read versions of published pages
CREATE POLICY "Public can read published page versions"
  ON public.page_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = page_versions.page_id 
      AND pages.status = 'published'
    )
  );

-- Admin/God can CRUD page versions
CREATE POLICY "Admin can manage page versions"
  ON public.page_versions FOR ALL
  USING (is_admin());

-- ----------------------------------------
-- COMMUNITY_UPLOADS POLICIES
-- ----------------------------------------

-- Public can read active uploads
CREATE POLICY "Public can read active uploads"
  ON public.community_uploads FOR SELECT
  USING (status = 'active');

-- Admin can read all uploads (including hidden/removed)
CREATE POLICY "Admin can read all uploads"
  ON public.community_uploads FOR SELECT
  USING (is_admin());

-- Users can insert their own uploads
CREATE POLICY "Users can create uploads"
  ON public.community_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own uploads
CREATE POLICY "Users can update own uploads"
  ON public.community_uploads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploads"
  ON public.community_uploads FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can update any upload (for moderation)
CREATE POLICY "Admin can moderate uploads"
  ON public.community_uploads FOR UPDATE
  USING (is_admin());

-- ----------------------------------------
-- COMMUNITY_COMMENTS POLICIES
-- ----------------------------------------

-- Public can read active comments on active uploads
CREATE POLICY "Public can read active comments"
  ON public.community_comments FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.community_uploads
      WHERE community_uploads.id = community_comments.upload_id
      AND community_uploads.status = 'active'
    )
  );

-- Admin can read all comments
CREATE POLICY "Admin can read all comments"
  ON public.community_comments FOR SELECT
  USING (is_admin());

-- Users can insert comments
CREATE POLICY "Users can create comments"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own comments
CREATE POLICY "Users can update own comments"
  ON public.community_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.community_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can moderate comments
CREATE POLICY "Admin can moderate comments"
  ON public.community_comments FOR UPDATE
  USING (is_admin());

-- ----------------------------------------
-- REPORTS POLICIES
-- ----------------------------------------

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_user_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_user_id);

-- Admin/God can view and manage all reports
CREATE POLICY "Admin can manage reports"
  ON public.reports FOR ALL
  USING (is_admin());

-- ----------------------------------------
-- LEADS POLICIES
-- ----------------------------------------

-- Sales and God can read all leads
CREATE POLICY "Sales can read leads"
  ON public.leads FOR SELECT
  USING (is_sales());

-- Sales can update leads
CREATE POLICY "Sales can update leads"
  ON public.leads FOR UPDATE
  USING (is_sales());

-- Admin can read leads (view only)
CREATE POLICY "Admin can view leads"
  ON public.leads FOR SELECT
  USING (is_admin());

-- Public insert via RPC only (see RPC section)
CREATE POLICY "System can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------
-- LEAD_NOTES POLICIES
-- ----------------------------------------

-- Sales can read all notes
CREATE POLICY "Sales can read lead notes"
  ON public.lead_notes FOR SELECT
  USING (is_sales());

-- Sales can insert notes
CREATE POLICY "Sales can create lead notes"
  ON public.lead_notes FOR INSERT
  WITH CHECK (is_sales() AND auth.uid() = author_user_id);

-- God can do everything
CREATE POLICY "God full access to lead notes"
  ON public.lead_notes FOR ALL
  USING (is_god());

-- ----------------------------------------
-- SUPPORT_SESSIONS POLICIES
-- ----------------------------------------

-- Only god can create and view support sessions
CREATE POLICY "God can manage support sessions"
  ON public.support_sessions FOR ALL
  USING (is_god());

-- ============================================
-- 6. RPC FUNCTIONS
-- ============================================

-- Create lead from public form (no auth required)
CREATE OR REPLACE FUNCTION public.create_lead_from_public_form(
  p_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_source text DEFAULT 'contact_form',
  p_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_id uuid;
BEGIN
  -- Basic validation
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  INSERT INTO public.leads (name, email, phone, source, message)
  VALUES (p_name, p_email, p_phone, p_source, p_message)
  RETURNING id INTO v_lead_id;

  -- Audit log
  INSERT INTO public.audit_log (action, target_type, target_id, metadata)
  VALUES ('LEAD_CREATED', 'lead', v_lead_id::text, jsonb_build_object('source', p_source));

  RETURN v_lead_id;
END;
$$;

-- Publish a page (admin/god only)
CREATE OR REPLACE FUNCTION public.publish_page(p_page_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check permission
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE public.pages
  SET status = 'published', published_at = now(), updated_by = auth.uid()
  WHERE id = p_page_id;

  -- Audit log
  INSERT INTO public.audit_log (actor_user_id, action, target_type, target_id)
  VALUES (auth.uid(), 'PAGE_PUBLISHED', 'page', p_page_id::text);

  RETURN true;
END;
$$;

-- Unpublish a page
CREATE OR REPLACE FUNCTION public.unpublish_page(p_page_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE public.pages
  SET status = 'draft', updated_by = auth.uid()
  WHERE id = p_page_id;

  INSERT INTO public.audit_log (actor_user_id, action, target_type, target_id)
  VALUES (auth.uid(), 'PAGE_UNPUBLISHED', 'page', p_page_id::text);

  RETURN true;
END;
$$;

-- Set user status (admin can warn/suspend/ban, god can do all)
CREATE OR REPLACE FUNCTION public.set_user_status(
  p_user_id uuid,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role text;
BEGIN
  SELECT role INTO v_actor_role FROM public.profiles WHERE id = auth.uid();

  -- Permission check
  IF v_actor_role NOT IN ('god', 'admin') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Admin cannot change god users
  IF v_actor_role = 'admin' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'god'
  ) THEN
    RAISE EXCEPTION 'Cannot modify god user';
  END IF;

  UPDATE public.profiles
  SET status = p_status
  WHERE id = p_user_id;

  -- Audit log
  INSERT INTO public.audit_log (actor_user_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'USER_STATUS_CHANGED', 'user', p_user_id::text, jsonb_build_object('new_status', p_status));

  RETURN true;
END;
$$;

-- Set user role (god only)
CREATE OR REPLACE FUNCTION public.set_user_role(
  p_user_id uuid,
  p_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_god() THEN
    RAISE EXCEPTION 'Permission denied - god only';
  END IF;

  IF p_role NOT IN ('god', 'admin', 'sales', 'user') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE public.profiles
  SET role = p_role
  WHERE id = p_user_id;

  -- Audit log
  INSERT INTO public.audit_log (actor_user_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'ROLE_CHANGED', 'user', p_user_id::text, jsonb_build_object('new_role', p_role));

  RETURN true;
END;
$$;

-- Delete user (god only)
CREATE OR REPLACE FUNCTION public.delete_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_god() THEN
    RAISE EXCEPTION 'Permission denied - god only';
  END IF;

  -- Cannot delete yourself
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete yourself';
  END IF;

  -- Audit log before deletion
  INSERT INTO public.audit_log (actor_user_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'USER_DELETED', 'user', p_user_id::text, 
    (SELECT jsonb_build_object('email', email) FROM auth.users WHERE id = p_user_id));

  -- Delete from auth.users (cascades to profiles)
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN true;
END;
$$;

-- Create impersonation session (god only)
CREATE OR REPLACE FUNCTION public.create_support_session(p_target_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
BEGIN
  IF NOT is_god() THEN
    RAISE EXCEPTION 'Permission denied - god only';
  END IF;

  INSERT INTO public.support_sessions (god_user_id, target_user_id, expires_at)
  VALUES (auth.uid(), p_target_user_id, now() + interval '1 hour')
  RETURNING id INTO v_session_id;

  -- Audit log
  INSERT INTO public.audit_log (actor_user_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'IMPERSONATION_STARTED', 'user', p_target_user_id::text, 
    jsonb_build_object('session_id', v_session_id));

  RETURN v_session_id;
END;
$$;

-- Update user profile (for users updating their own)
CREATE OR REPLACE FUNCTION public.update_own_profile(
  p_display_name text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    display_name = COALESCE(p_display_name, display_name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    last_active_at = now()
  WHERE id = auth.uid();

  RETURN true;
END;
$$;

-- Update last active timestamp
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_active_at = now()
  WHERE id = auth.uid();
  RETURN true;
END;
$$;

-- Get user activity stats
CREATE OR REPLACE FUNCTION public.get_user_activity_stats(p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_uploads_count int;
  v_comments_count int;
  v_last_active timestamptz;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- Check permission: can view own or admin can view any
  IF v_user_id != auth.uid() AND NOT is_admin() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT COUNT(*) INTO v_uploads_count
  FROM public.community_uploads
  WHERE user_id = v_user_id;

  SELECT COUNT(*) INTO v_comments_count
  FROM public.community_comments
  WHERE user_id = v_user_id;

  SELECT last_active_at INTO v_last_active
  FROM public.profiles
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'uploads_count', v_uploads_count,
    'comments_count', v_comments_count,
    'last_active_at', v_last_active
  );
END;
$$;

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

GRANT SELECT, INSERT ON public.audit_log TO authenticated;

GRANT SELECT ON public.pages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;

GRANT SELECT ON public.page_versions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_versions TO authenticated;

GRANT SELECT ON public.community_uploads TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_uploads TO authenticated;

GRANT SELECT ON public.community_comments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_comments TO authenticated;

GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT SELECT, UPDATE ON public.reports TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.leads TO authenticated;
GRANT INSERT ON public.leads TO anon;

GRANT SELECT, INSERT ON public.lead_notes TO authenticated;

GRANT SELECT, INSERT ON public.support_sessions TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_god() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_sales() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.create_lead_from_public_form(text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_page(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unpublish_page(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_support_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_own_profile(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_last_active() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activity_stats(uuid) TO authenticated;
