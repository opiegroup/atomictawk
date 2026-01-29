'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient, useRole, AuditLog } from '@/lib/supabase'
import { 
  ClipboardList, 
  User, 
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react'

export default function AuditPage() {
  const { isGod } = useRole()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const limit = 50

  useEffect(() => {
    fetchLogs()
  }, [actionFilter, page])

  const fetchLogs = async () => {
    setLoading(true)
    const supabase = getSupabaseClient()
    if (!supabase) return
    
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (actionFilter !== 'all') {
      query = query.eq('action', actionFilter)
    }

    const { data, error } = await query

    if (!error && data) {
      setLogs(data)
    }
    setLoading(false)
  }

  const actionColors: Record<string, string> = {
    USER_STATUS_CHANGED: 'bg-yellow-500/20 text-yellow-400',
    USER_DELETED: 'bg-red-500/20 text-red-400',
    ROLE_CHANGED: 'bg-purple-500/20 text-purple-400',
    IMPERSONATION_STARTED: 'bg-orange-500/20 text-orange-400',
    PAGE_PUBLISHED: 'bg-green-500/20 text-green-400',
    PAGE_UNPUBLISHED: 'bg-zinc-500/20 text-zinc-400',
    LEAD_CREATED: 'bg-blue-500/20 text-blue-400',
  }

  const uniqueActions = [...new Set(logs.map(l => l.action))]

  if (!isGod) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">Only God users can view the audit log.</p>
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
            <ClipboardList className="w-8 h-8 text-[#CCAA4C]" />
            Audit Log
          </h1>
          <p className="text-[#AEACA1] mt-1">
            Track all sensitive actions across the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#353535] rounded-lg p-4 mb-6 flex items-center gap-4">
        <Filter className="w-5 h-5 text-[#AEACA1]" />
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0) }}
          className="px-4 py-2 bg-[#1f1c13] border border-[#AEACA1]/20 rounded-lg text-white focus:outline-none focus:border-[#CCAA4C]"
        >
          <option value="all">All Actions</option>
          <option value="USER_STATUS_CHANGED">User Status Changed</option>
          <option value="USER_DELETED">User Deleted</option>
          <option value="ROLE_CHANGED">Role Changed</option>
          <option value="IMPERSONATION_STARTED">Impersonation Started</option>
          <option value="PAGE_PUBLISHED">Page Published</option>
          <option value="PAGE_UNPUBLISHED">Page Unpublished</option>
          <option value="LEAD_CREATED">Lead Created</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-[#353535] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#AEACA1]">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-[#AEACA1]">No audit logs found</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#AEACA1]/20">
                  <th className="text-left p-4 text-[#AEACA1] font-medium text-sm uppercase">Time</th>
                  <th className="text-left p-4 text-[#AEACA1] font-medium text-sm uppercase">Action</th>
                  <th className="text-left p-4 text-[#AEACA1] font-medium text-sm uppercase">Actor</th>
                  <th className="text-left p-4 text-[#AEACA1] font-medium text-sm uppercase">Target</th>
                  <th className="text-left p-4 text-[#AEACA1] font-medium text-sm uppercase">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-[#AEACA1]/10 hover:bg-[#AEACA1]/5">
                    <td className="p-4 text-[#AEACA1] text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        actionColors[log.action] || 'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {log.actor_user_id ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#AEACA1]" />
                          <span className="text-white text-sm font-mono truncate max-w-[150px]">
                            {log.actor_user_id.slice(0, 8)}...
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#AEACA1] text-sm">System</span>
                      )}
                    </td>
                    <td className="p-4 text-[#AEACA1] text-sm">
                      {log.target_type && (
                        <span className="capitalize">{log.target_type}: </span>
                      )}
                      {log.target_id && (
                        <span className="font-mono">{log.target_id.slice(0, 8)}...</span>
                      )}
                    </td>
                    <td className="p-4">
                      {log.metadata && Object.keys(log.metadata as object).length > 0 && (
                        <details className="text-sm">
                          <summary className="text-[#CCAA4C] cursor-pointer hover:text-[#CCAA4C]/80">
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-[#1f1c13] rounded text-[#AEACA1] text-xs overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-[#AEACA1]/20">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-[#1f1c13] text-[#AEACA1] rounded font-bold text-sm hover:bg-[#AEACA1]/10 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-[#AEACA1] text-sm">Page {page + 1}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={logs.length < limit}
                className="px-4 py-2 bg-[#1f1c13] text-[#AEACA1] rounded font-bold text-sm hover:bg-[#AEACA1]/10 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
