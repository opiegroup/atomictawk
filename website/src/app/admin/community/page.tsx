'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient, useRole, CommunityUpload, CommunityComment, Report } from '@/lib/supabase'
import { 
  MessageSquare, 
  Image, 
  Flag, 
  Eye, 
  EyeOff, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

type Tab = 'uploads' | 'comments' | 'reports'

export default function CommunityPage() {
  const { isAdmin } = useRole()
  const [activeTab, setActiveTab] = useState<Tab>('uploads')
  const [uploads, setUploads] = useState<(CommunityUpload & { profile?: { display_name: string } })[]>([])
  const [comments, setComments] = useState<(CommunityComment & { profile?: { display_name: string } })[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    const supabase = getSupabaseClient()
    if (!supabase) return

    if (activeTab === 'uploads') {
      const { data } = await supabase
        .from('community_uploads')
        .select('*, profile:profiles(display_name)')
        .order('created_at', { ascending: false })
      setUploads(data || [])
    } else if (activeTab === 'comments') {
      const { data } = await supabase
        .from('community_comments')
        .select('*, profile:profiles(display_name)')
        .order('created_at', { ascending: false })
      setComments(data || [])
    } else {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
      setReports(data || [])
    }
    setLoading(false)
  }

  const updateUploadStatus = async (id: string, status: 'active' | 'hidden' | 'removed') => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await (supabase.from('community_uploads') as any).update({ status }).eq('id', id)
    setUploads(uploads.map(u => u.id === id ? { ...u, status } : u))
  }

  const updateCommentStatus = async (id: string, status: 'active' | 'hidden' | 'removed') => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await (supabase.from('community_comments') as any).update({ status }).eq('id', id)
    setComments(comments.map(c => c.id === id ? { ...c, status } : c))
  }

  const updateReportStatus = async (id: string, status: 'open' | 'reviewing' | 'closed') => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await (supabase.from('reports') as any).update({ status }).eq('id', id)
    setReports(reports.map(r => r.id === id ? { ...r, status } : r))
  }

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    hidden: 'bg-yellow-500/20 text-yellow-400',
    removed: 'bg-red-500/20 text-red-400',
    open: 'bg-blue-500/20 text-blue-400',
    reviewing: 'bg-yellow-500/20 text-yellow-400',
    closed: 'bg-zinc-500/20 text-zinc-400'
  }

  if (!isAdmin) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#CCAA4C]" />
            Community Moderation
          </h1>
          <p className="text-[#AEACA1] mt-1">
            Review and moderate user-generated content
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'uploads', label: 'Uploads', icon: Image, count: uploads.length },
          { id: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
          { id: 'reports', label: 'Reports', icon: Flag, count: reports.filter(r => r.status === 'open').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm uppercase transition-colors ${
              activeTab === tab.id
                ? 'bg-[#CCAA4C] text-[#353535]'
                : 'bg-[#353535] text-[#AEACA1] hover:bg-[#AEACA1]/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-[#353535]/20' : 'bg-[#CCAA4C]/20 text-[#CCAA4C]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[#353535] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#AEACA1]">Loading...</div>
        ) : (
          <>
            {/* Uploads Tab */}
            {activeTab === 'uploads' && (
              <div className="divide-y divide-[#AEACA1]/10">
                {uploads.length === 0 ? (
                  <div className="p-8 text-center text-[#AEACA1]">No uploads yet</div>
                ) : (
                  uploads.map(upload => (
                    <div key={upload.id} className="p-4 flex items-start gap-4">
                      <div className="w-20 h-20 bg-[#1f1c13] rounded overflow-hidden flex-shrink-0">
                        {upload.media_type === 'image' && upload.media_url && (
                          <img src={upload.media_url} alt="" className="w-full h-full object-cover" />
                        )}
                        {upload.media_type === 'video' && (
                          <div className="w-full h-full flex items-center justify-center text-[#AEACA1]">
                            <Image className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{upload.title || 'Untitled'}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${statusColors[upload.status]}`}>
                            {upload.status}
                          </span>
                        </div>
                        <p className="text-[#AEACA1] text-sm truncate">{upload.caption}</p>
                        <p className="text-[#AEACA1] text-xs mt-1">
                          by {(upload as any).profile?.display_name || 'Unknown'} • {new Date(upload.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {upload.status !== 'active' && (
                          <button
                            onClick={() => updateUploadStatus(upload.id, 'active')}
                            className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                            title="Make Active"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {upload.status !== 'hidden' && (
                          <button
                            onClick={() => updateUploadStatus(upload.id, 'hidden')}
                            className="p-2 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30"
                            title="Hide"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        {upload.status !== 'removed' && (
                          <button
                            onClick={() => updateUploadStatus(upload.id, 'removed')}
                            className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="divide-y divide-[#AEACA1]/10">
                {comments.length === 0 ? (
                  <div className="p-8 text-center text-[#AEACA1]">No comments yet</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="p-4 flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            {(comment as any).profile?.display_name || 'Unknown'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${statusColors[comment.status]}`}>
                            {comment.status}
                          </span>
                        </div>
                        <p className="text-[#AEACA1]">{comment.comment}</p>
                        <p className="text-[#AEACA1] text-xs mt-1">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {comment.status !== 'active' && (
                          <button
                            onClick={() => updateCommentStatus(comment.id, 'active')}
                            className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {comment.status !== 'hidden' && (
                          <button
                            onClick={() => updateCommentStatus(comment.id, 'hidden')}
                            className="p-2 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        {comment.status !== 'removed' && (
                          <button
                            onClick={() => updateCommentStatus(comment.id, 'removed')}
                            className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="divide-y divide-[#AEACA1]/10">
                {reports.length === 0 ? (
                  <div className="p-8 text-center text-[#AEACA1]">No reports</div>
                ) : (
                  reports.map(report => (
                    <div key={report.id} className="p-4 flex items-start gap-4">
                      <div className={`p-2 rounded ${
                        report.status === 'open' ? 'bg-red-500/20' :
                        report.status === 'reviewing' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                      }`}>
                        {report.status === 'open' ? <AlertTriangle className="w-5 h-5 text-red-400" /> :
                         report.status === 'reviewing' ? <Clock className="w-5 h-5 text-yellow-400" /> :
                         <CheckCircle className="w-5 h-5 text-green-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium capitalize">{report.target_type} Report</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${statusColors[report.status]}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-[#AEACA1]">{report.reason || 'No reason provided'}</p>
                        <p className="text-[#AEACA1] text-xs mt-1">
                          Target ID: {report.target_id} • {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {report.status === 'open' && (
                          <button
                            onClick={() => updateReportStatus(report.id, 'reviewing')}
                            className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm font-bold hover:bg-yellow-500/30"
                          >
                            Review
                          </button>
                        )}
                        {report.status !== 'closed' && (
                          <button
                            onClick={() => updateReportStatus(report.id, 'closed')}
                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-bold hover:bg-green-500/30"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
