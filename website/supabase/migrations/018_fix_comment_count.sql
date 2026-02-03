-- ============================================
-- FIX USER ACTIVITY STATS TO COUNT ALL COMMENTS
-- ============================================

-- Update the function to count comments from ALL comment tables
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

  -- Count uploads from community_uploads
  SELECT COUNT(*) INTO v_uploads_count
  FROM public.community_uploads
  WHERE user_id = v_user_id;

  -- Count comments from ALL comment tables
  SELECT 
    COALESCE((SELECT COUNT(*) FROM public.community_comments WHERE user_id = v_user_id), 0) +
    COALESCE((SELECT COUNT(*) FROM public.content_comments WHERE user_id = v_user_id), 0) +
    COALESCE((SELECT COUNT(*) FROM public.community_post_comments WHERE user_id = v_user_id), 0) +
    COALESCE((SELECT COUNT(*) FROM public.gallery_comments WHERE user_id = v_user_id), 0)
  INTO v_comments_count;

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
