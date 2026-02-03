'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, Send, ThumbsUp, Reply, Flag, Loader2, AlertTriangle, LogIn, ShieldAlert } from 'lucide-react'
import { useAuth, getSupabaseClient } from '@/lib/supabase'
import { validateComment, containsProfanity } from '@/lib/profanityFilter'
import { BadgeList, Badge } from '@/components/badges'

interface Comment {
  id: string
  body: string
  created_at: string
  like_count: number
  parent_id: string | null
  user: {
    id: string
    display_name: string
    avatar_url: string | null
    badges?: Badge[]
  }
  replies?: Comment[]
  hasLiked?: boolean
}

interface CommentsProps {
  contentId: string
  contentType?: 'content' | 'community' // Different tables
}

export function Comments({ contentId, contentType = 'content' }: CommentsProps) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [languageWarning, setLanguageWarning] = useState<string | null>(null)

  // Check for profanity as user types
  const checkLanguage = (text: string) => {
    if (text.length > 3) {
      const check = containsProfanity(text)
      if (check.hasProfanity) {
        if (check.severity === 'high') {
          setLanguageWarning('Your comment contains language that is not allowed')
        } else if (check.severity === 'medium') {
          setLanguageWarning('Your comment may contain inappropriate language')
        } else {
          setLanguageWarning(null) // Low severity will be auto-censored
        }
      } else {
        setLanguageWarning(null)
      }
    } else {
      setLanguageWarning(null)
    }
  }

  const handleCommentChange = (text: string) => {
    setNewComment(text)
    checkLanguage(text)
  }

  const handleReplyChange = (text: string) => {
    setReplyText(text)
    checkLanguage(text)
  }

  // Load comments
  useEffect(() => {
    loadComments()
  }, [contentId])

  const loadComments = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    setLoading(true)
    try {
      const tableName = contentType === 'content' ? 'content_comments' : 'community_comments'
      const contentColumn = contentType === 'content' ? 'content_id' : 'upload_id'

      // Get comments with user info
      const { data, error: fetchError } = await (supabase as any)
        .from(tableName)
        .select(`
          id,
          body,
          created_at,
          like_count,
          parent_id,
          user_id
        `)
        .eq(contentColumn, contentId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      // Get user profiles for comments
      const userIds = [...new Set((data || []).map((c: any) => c.user_id))]
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds)

      // Get badges for all comment users
      const badgesByUser = new Map<string, Badge[]>()
      for (const userId of userIds) {
        try {
          const { data: userBadges } = await (supabase as any).rpc('get_user_badges', { p_user_id: userId })
          if (userBadges) {
            badgesByUser.set(userId, userBadges.slice(0, 3)) // Only show top 3 badges
          }
        } catch (e) {
          // Ignore badge fetch errors
        }
      }

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, { ...p, badges: badgesByUser.get(p.id) || [] }]))

      // Check which comments user has liked
      let likedIds: string[] = []
      if (user && contentType === 'content') {
        const { data: likes } = await (supabase as any)
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', (data || []).map((c: any) => c.id))
        
        likedIds = (likes || []).map((l: any) => l.comment_id)
      }

      // Build comment tree
      const commentsWithUsers = (data || []).map((c: any) => ({
        ...c,
        user: profileMap.get(c.user_id) || { id: c.user_id, display_name: 'Anonymous', avatar_url: null },
        hasLiked: likedIds.includes(c.id),
      }))

      // Separate top-level and replies
      const topLevel = commentsWithUsers.filter((c: Comment) => !c.parent_id)
      const replies = commentsWithUsers.filter((c: Comment) => c.parent_id)

      // Attach replies to parents
      const commentsTree = topLevel.map((comment: Comment) => ({
        ...comment,
        replies: replies.filter((r: Comment) => r.parent_id === comment.id)
      }))

      setComments(commentsTree)
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async (parentId: string | null = null) => {
    if (!user) {
      setError('Please log in to comment')
      return
    }

    const text = parentId ? replyText : newComment
    if (!text.trim()) return

    // Validate comment for profanity
    const validation = validateComment(text)
    if (!validation.isValid) {
      setError(validation.reason || 'Invalid comment')
      return
    }

    // Use censored text if available (for low severity profanity)
    const finalText = validation.censoredText || text

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error('Not connected')

      if (contentType === 'content') {
        // Use the submit_comment function for spam checking
        const { data, error: submitError } = await (supabase as any).rpc('submit_comment', {
          p_content_id: contentId,
          p_body: finalText.trim(),
          p_parent_id: parentId,
        })

        if (submitError) throw submitError

        const result = data?.[0] || data
        if (result?.status === 'error') {
          throw new Error(result.message)
        }

        if (result?.status === 'pending') {
          setSuccess('Your comment is pending moderation')
        } else if (result?.status === 'spam') {
          setError('Your comment was flagged as spam')
        } else {
          setSuccess('Comment posted!')
          await loadComments()
        }
      } else {
        // Direct insert for community comments
        const { error: insertError } = await (supabase as any)
          .from('community_comments')
          .insert({
            upload_id: contentId,
            user_id: user.id,
            comment: finalText.trim(),
            status: 'active'
          })

        if (insertError) throw insertError
        setSuccess('Comment posted!')
        await loadComments()
      }

      // Clear input
      if (parentId) {
        setReplyText('')
        setReplyingTo(null)
      } else {
        setNewComment('')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLike = async (commentId: string) => {
    if (!user) return

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      const comment = comments.find(c => c.id === commentId) || 
                      comments.flatMap(c => c.replies || []).find(c => c.id === commentId)
      
      if (!comment) return

      if (comment.hasLiked) {
        // Unlike
        await (supabase as any)
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
      } else {
        // Like
        await (supabase as any)
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id })
      }

      // Update local state
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { 
            ...c, 
            hasLiked: !c.hasLiked, 
            like_count: c.hasLiked ? c.like_count - 1 : c.like_count + 1 
          }
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => 
              r.id === commentId 
                ? { ...r, hasLiked: !r.hasLiked, like_count: r.hasLiked ? r.like_count - 1 : r.like_count + 1 }
                : r
            )
          }
        }
        return c
      }))
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-[#353535]' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#353535] flex items-center justify-center shrink-0 overflow-hidden">
          {comment.user.avatar_url ? (
            <img src={comment.user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#CCAA4C] font-bold">
              {comment.user.display_name?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>

        <div className="flex-grow">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-white text-sm">{comment.user.display_name}</span>
            {comment.user.badges && comment.user.badges.length > 0 && (
              <BadgeList badges={comment.user.badges} size="sm" maxDisplay={3} />
            )}
            <span className="text-xs text-[#666]">{formatDate(comment.created_at)}</span>
          </div>

          {/* Body */}
          <p className="text-[#ccc] text-sm whitespace-pre-wrap">{comment.body}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => toggleLike(comment.id)}
              disabled={!user}
              className={`flex items-center gap-1 text-xs ${
                comment.hasLiked ? 'text-[#CCAA4C]' : 'text-[#666] hover:text-[#CCAA4C]'
              } disabled:opacity-50`}
            >
              <ThumbsUp className="w-3 h-3" />
              {comment.like_count > 0 && comment.like_count}
            </button>

            {!isReply && user && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs text-[#666] hover:text-[#CCAA4C]"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => handleReplyChange(e.target.value)}
                  placeholder="Write a reply..."
                  className={`flex-grow px-3 py-2 bg-[#1a1a1a] border rounded text-white text-sm focus:outline-none ${
                    languageWarning ? 'border-orange-500 focus:border-orange-500' : 'border-[#353535] focus:border-[#CCAA4C]'
                  }`}
                  onKeyDown={(e) => e.key === 'Enter' && !languageWarning && submitComment(comment.id)}
                />
                <button
                  onClick={() => submitComment(comment.id)}
                  disabled={submitting || !replyText.trim() || !!languageWarning}
                  className="px-4 py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold text-sm rounded hover:bg-[#CCAA4C]/80 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reply'}
                </button>
              </div>
              {languageWarning && (
                <div className="mt-1 flex items-center gap-1 text-orange-400 text-xs">
                  <ShieldAlert className="w-3 h-3" />
                  {languageWarning}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-[#252525] border-4 border-[#353535] rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-[#CCAA4C]" />
        <h3 className="font-bold text-white uppercase tracking-wider">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* New Comment Form */}
      {user ? (
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[#353535] flex items-center justify-center shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#CCAA4C] font-bold">
                  {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => handleCommentChange(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded text-white text-sm focus:outline-none resize-none ${
                  languageWarning ? 'border-orange-500 focus:border-orange-500' : 'border-[#353535] focus:border-[#CCAA4C]'
                }`}
              />
              {languageWarning && (
                <div className="mt-1 flex items-center gap-1 text-orange-400 text-xs">
                  <ShieldAlert className="w-3 h-3" />
                  {languageWarning}
                </div>
              )}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => submitComment()}
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-sm tracking-wider hover:bg-[#CCAA4C]/80 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 bg-[#1a1a1a] rounded border border-[#353535] text-center">
          <LogIn className="w-8 h-8 mx-auto mb-2 text-[#666]" />
          <p className="text-[#888] mb-3">Log in to join the conversation</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-sm tracking-wider hover:bg-[#CCAA4C]/80"
          >
            <LogIn className="w-4 h-4" />
            Log In
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#CCAA4C]" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-[#666]">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}
