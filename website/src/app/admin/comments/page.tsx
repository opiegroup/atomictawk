'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MessageSquare, Check, X, Trash2, AlertTriangle, Shield, 
  Ban, Search, Filter, Loader2, Eye, RefreshCw
} from 'lucide-react'
import { useAuth, useRole, getSupabaseClient } from '@/lib/supabase'

interface Comment {
  id: string
  content_id: string
  user_id: string
  body: string
  status: string
  is_spam: boolean
  spam_score: number
  ip_address: string
  created_at: string
  content?: {
    title: string
    slug: string
  }
  profile?: {
    display_name: string
    email: string
  }
}

interface BlockedItem {
  id: string
  block_type: string
  block_value: string
  reason: string
  times_blocked: number
  created_at: string
}

export default function CommentsAdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: roleLoading } = useRole()
  
  const [comments, setComments] = useState<Comment[]>([])
  const [blocklist, setBlocklist] = useState<BlockedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'spam' | 'blocklist'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  // New block item state
  const [newBlockType, setNewBlockType] = useState<'ip' | 'word' | 'email' | 'domain'>('word')
  const [newBlockValue, setNewBlockValue] = useState('')
  const [newBlockReason, setNewBlockReason] = useState('')

  useEffect(() => {
    if (!authLoading && !roleLoading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [user, isAdmin, authLoading, roleLoading, router])

  useEffect(() => {
    if (user && isAdmin) {
      loadData()
    }
  }, [user, isAdmin, activeTab])

  const loadData = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    setLoading(true)
    try {
      if (activeTab === 'blocklist') {
        // Load blocklist
        const { data } = await (supabase as any)
          .from('spam_blocklist')
          .select('*')
          .order('created_at', { ascending: false })
        setBlocklist(data || [])
      } else {
        // Load comments by status
        let query = (supabase as any)
          .from('content_comments')
          .select(`
            *,
            content:content_id(title, slug)
          `)
          .order('created_at', { ascending: false })

        if (activeTab === 'pending') {
          query = query.eq('status', 'pending')
        } else if (activeTab === 'approved') {
          query = query.eq('status', 'approved')
        } else if (activeTab === 'spam') {
          query = query.in('status', ['spam', 'rejected'])
        }

        const { data } = await query.limit(100)

        // Get user profiles
        const userIds = [...new Set((data || []).map((c: any) => c.user_id))]
        if (userIds.length > 0) {
          const { data: profiles } = await (supabase as any)
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds)

          const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
          const commentsWithProfiles = (data || []).map((c: any) => ({
            ...c,
            profile: profileMap.get(c.user_id)
          }))
          setComments(commentsWithProfiles)
        } else {
          setComments(data || [])
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCommentStatus = async (commentId: string, newStatus: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    setProcessing(commentId)
    try {
      await (supabase as any)
        .from('content_comments')
        .update({ 
          status: newStatus,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', commentId)

      // Update comment count if approving
      if (newStatus === 'approved') {
        const comment = comments.find(c => c.id === commentId)
        if (comment) {
          await (supabase as any)
            .from('content')
            .update({ comment_count: supabase.rpc('increment_comment_count') })
            .eq('id', comment.content_id)
        }
      }

      await loadData()
    } catch (error) {
      console.error('Error updating comment:', error)
    } finally {
      setProcessing(null)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment permanently?')) return

    const supabase = getSupabaseClient()
    if (!supabase) return

    setProcessing(commentId)
    try {
      await (supabase as any)
        .from('content_comments')
        .delete()
        .eq('id', commentId)
      await loadData()
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setProcessing(null)
    }
  }

  const blockUser = async (comment: Comment) => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      // Add user to blocklist
      await (supabase as any)
        .from('spam_blocklist')
        .insert({
          block_type: 'user',
          block_value: comment.user_id,
          reason: 'Blocked from comment moderation',
          blocked_by: user?.id
        })

      // Mark comment as spam
      await updateCommentStatus(comment.id, 'spam')
      alert('User blocked')
    } catch (error) {
      console.error('Error blocking user:', error)
    }
  }

  const addToBlocklist = async () => {
    if (!newBlockValue.trim()) return

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await (supabase as any)
        .from('spam_blocklist')
        .insert({
          block_type: newBlockType,
          block_value: newBlockValue.trim().toLowerCase(),
          reason: newBlockReason || `Added by admin`,
          blocked_by: user?.id
        })

      setNewBlockValue('')
      setNewBlockReason('')
      await loadData()
    } catch (error) {
      console.error('Error adding to blocklist:', error)
    }
  }

  const removeFromBlocklist = async (id: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await (supabase as any)
        .from('spam_blocklist')
        .delete()
        .eq('id', id)
      await loadData()
    } catch (error) {
      console.error('Error removing from blocklist:', error)
    }
  }

  const filteredComments = comments.filter(c => 
    !searchQuery || 
    c.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || roleLoading || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#CCAA4C]" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#CCAA4C]" />
            Comment Moderation
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Approve, reject, and manage spam
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 text-[#888] hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'pending', label: 'Pending', icon: AlertTriangle, color: 'text-yellow-500' },
          { id: 'approved', label: 'Approved', icon: Check, color: 'text-green-500' },
          { id: 'spam', label: 'Spam/Rejected', icon: Ban, color: 'text-red-500' },
          { id: 'blocklist', label: 'Blocklist', icon: Shield, color: 'text-purple-500' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 font-bold uppercase text-sm tracking-wider border-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-[#CCAA4C] border-[#CCAA4C] text-[#1a1a1a]'
                : 'bg-transparent border-[#353535] text-[#888] hover:border-[#CCAA4C]/50'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? '' : tab.color}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab !== 'blocklist' && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#252525] border border-[#353535] rounded text-white text-sm focus:border-[#CCAA4C] focus:outline-none"
          />
        </div>
      )}

      {/* Content */}
      {activeTab === 'blocklist' ? (
        <div className="space-y-4">
          {/* Add new block */}
          <div className="bg-[#252525] border-2 border-[#353535] rounded p-4">
            <h3 className="font-bold text-white mb-3">Add to Blocklist</h3>
            <div className="flex flex-wrap gap-3">
              <select
                value={newBlockType}
                onChange={(e) => setNewBlockType(e.target.value as any)}
                className="px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm"
              >
                <option value="word">Word/Phrase</option>
                <option value="ip">IP Address</option>
                <option value="email">Email</option>
                <option value="domain">Domain</option>
              </select>
              <input
                type="text"
                value={newBlockValue}
                onChange={(e) => setNewBlockValue(e.target.value)}
                placeholder={newBlockType === 'word' ? 'spam word' : newBlockType === 'ip' ? '192.168.1.1' : 'value'}
                className="flex-grow px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm"
              />
              <input
                type="text"
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                placeholder="Reason (optional)"
                className="px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white text-sm"
              />
              <button
                onClick={addToBlocklist}
                disabled={!newBlockValue.trim()}
                className="px-4 py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold text-sm uppercase disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Blocklist */}
          <div className="bg-[#252525] border-2 border-[#353535] rounded overflow-hidden">
            <div className="p-4 border-b border-[#353535]">
              <span className="text-sm text-[#888]">{blocklist.length} blocked items</span>
            </div>
            <div className="divide-y divide-[#353535]">
              {blocklist.map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#353535] text-[#CCAA4C] text-xs font-bold uppercase rounded">
                        {item.block_type}
                      </span>
                      <span className="text-white font-mono">{item.block_value}</span>
                    </div>
                    {item.reason && <p className="text-xs text-[#666] mt-1">{item.reason}</p>}
                    <p className="text-xs text-[#666]">Blocked {item.times_blocked} times</p>
                  </div>
                  <button
                    onClick={() => removeFromBlocklist(item.id)}
                    className="p-2 text-[#666] hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {blocklist.length === 0 && (
                <div className="p-8 text-center text-[#666]">
                  No blocked items
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#252525] border-2 border-[#353535] rounded overflow-hidden">
          <div className="p-4 border-b border-[#353535]">
            <span className="text-sm text-[#888]">{filteredComments.length} comments</span>
          </div>
          <div className="divide-y divide-[#353535]">
            {filteredComments.map(comment => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-grow">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white">{comment.profile?.display_name || 'Unknown'}</span>
                      <span className="text-xs text-[#666]">
                        on {comment.content?.title || 'Unknown content'}
                      </span>
                      {comment.spam_score > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          comment.spam_score > 0.7 ? 'bg-red-500/20 text-red-400' :
                          comment.spam_score > 0.3 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          Spam: {Math.round(comment.spam_score * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <p className="text-[#ccc] text-sm whitespace-pre-wrap mb-2">{comment.body}</p>

                    {/* Meta */}
                    <div className="text-xs text-[#666]">
                      {new Date(comment.created_at).toLocaleString()}
                      {comment.ip_address && ` • IP: ${comment.ip_address}`}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {activeTab === 'pending' && (
                      <>
                        <button
                          onClick={() => updateCommentStatus(comment.id, 'approved')}
                          disabled={processing === comment.id}
                          className="p-2 text-green-500 hover:bg-green-500/10 rounded"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateCommentStatus(comment.id, 'rejected')}
                          disabled={processing === comment.id}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {activeTab === 'spam' && (
                      <button
                        onClick={() => updateCommentStatus(comment.id, 'approved')}
                        disabled={processing === comment.id}
                        className="p-2 text-green-500 hover:bg-green-500/10 rounded"
                        title="Approve (not spam)"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => blockUser(comment)}
                      className="p-2 text-purple-500 hover:bg-purple-500/10 rounded"
                      title="Block user"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      disabled={processing === comment.id}
                      className="p-2 text-[#666] hover:text-red-500 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredComments.length === 0 && (
              <div className="p-8 text-center text-[#666]">
                No comments in this category
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
