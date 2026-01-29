'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient, useRole, useUser, Lead, LeadNote, LeadStatus } from '@/lib/supabase'
import { 
  Target, 
  Mail, 
  Phone, 
  MessageSquare,
  Calendar,
  Tag,
  User,
  Plus,
  Download,
  X
} from 'lucide-react'

export default function LeadsPage() {
  const { isSales, isGod } = useRole()
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [notes, setNotes] = useState<{ [leadId: string]: LeadNote[] }>({})
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLeads(data)
    }
    setLoading(false)
  }

  const fetchNotes = async (leadId: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { data } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (data) {
      setNotes(prev => ({ ...prev, [leadId]: data }))
    }
  }

  const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await (supabase.from('leads') as any).update({ status }).eq('id', leadId)
    setLeads(leads.map(l => l.id === leadId ? { ...l, status } : l))
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status })
    }
  }

  const addNote = async () => {
    if (!selectedLead || !newNote.trim() || !user) return

    const supabase = getSupabaseClient()
    if (!supabase) return
    const { data, error } = await (supabase.from('lead_notes') as any)
      .insert({
        lead_id: selectedLead.id,
        author_user_id: user.id,
        note: newNote.trim()
      })
      .select()
      .single()

    if (!error && data) {
      setNotes(prev => ({
        ...prev,
        [selectedLead.id]: [data, ...(prev[selectedLead.id] || [])]
      }))
      setNewNote('')
    }
  }

  const exportLeads = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Source', 'Status', 'Message', 'Created'],
      ...leads.map(l => [
        l.name || '',
        l.email || '',
        l.phone || '',
        l.source || '',
        l.status,
        l.message?.replace(/"/g, '""') || '',
        new Date(l.created_at).toISOString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const openLead = (lead: Lead) => {
    setSelectedLead(lead)
    if (!notes[lead.id]) {
      fetchNotes(lead.id)
    }
  }

  const filteredLeads = leads.filter(lead => 
    statusFilter === 'all' || lead.status === statusFilter
  )

  const statusColors: Record<LeadStatus, string> = {
    new: 'bg-blue-500/20 text-blue-400',
    contacted: 'bg-purple-500/20 text-purple-400',
    qualified: 'bg-yellow-500/20 text-yellow-400',
    won: 'bg-green-500/20 text-green-400',
    lost: 'bg-red-500/20 text-red-400'
  }

  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (!isSales && !isGod) {
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
            <Target className="w-8 h-8 text-[#CCAA4C]" />
            Leads Pipeline
          </h1>
          <p className="text-[#AEACA1] mt-1">
            Manage enquiries and sales leads
          </p>
        </div>
        <button
          onClick={exportLeads}
          className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#353535] rounded-lg font-bold text-sm hover:bg-[#CCAA4C]/80 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {(['new', 'contacted', 'qualified', 'won', 'lost'] as LeadStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            className={`p-4 rounded-lg transition-colors ${
              statusFilter === status 
                ? 'bg-[#CCAA4C] text-[#353535]' 
                : 'bg-[#353535] text-[#AEACA1] hover:bg-[#AEACA1]/10'
            }`}
          >
            <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
            <p className="text-sm font-medium uppercase">{status}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Leads List */}
        <div className="flex-1 bg-[#353535] rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#AEACA1]">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-[#AEACA1]">No leads found</div>
          ) : (
            <div className="divide-y divide-[#AEACA1]/10">
              {filteredLeads.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => openLead(lead)}
                  className={`w-full p-4 text-left hover:bg-[#AEACA1]/5 transition-colors ${
                    selectedLead?.id === lead.id ? 'bg-[#AEACA1]/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium">{lead.name || 'No name'}</p>
                      <p className="text-[#AEACA1] text-sm">{lead.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[#AEACA1] text-xs">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {lead.source || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lead Detail Panel */}
        {selectedLead && (
          <div className="w-96 bg-[#353535] rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedLead.name || 'No name'}</h2>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[selectedLead.status]}`}>
                  {selectedLead.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 text-[#AEACA1] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              {selectedLead.email && (
                <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 text-[#AEACA1] hover:text-[#CCAA4C]">
                  <Mail className="w-4 h-4" />
                  {selectedLead.email}
                </a>
              )}
              {selectedLead.phone && (
                <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 text-[#AEACA1] hover:text-[#CCAA4C]">
                  <Phone className="w-4 h-4" />
                  {selectedLead.phone}
                </a>
              )}
              <div className="flex items-center gap-2 text-[#AEACA1]">
                <Tag className="w-4 h-4" />
                {selectedLead.source || 'Unknown source'}
              </div>
            </div>

            {/* Message */}
            {selectedLead.message && (
              <div className="mb-6">
                <p className="text-sm font-medium text-[#AEACA1] mb-2">Message</p>
                <p className="text-white bg-[#1f1c13] rounded p-3 text-sm">
                  {selectedLead.message}
                </p>
              </div>
            )}

            {/* Status Update */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#AEACA1] mb-2">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {(['new', 'contacted', 'qualified', 'won', 'lost'] as LeadStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => updateLeadStatus(selectedLead.id, status)}
                    disabled={selectedLead.status === status}
                    className={`px-3 py-2 rounded text-xs font-bold uppercase transition-colors disabled:opacity-50 ${
                      selectedLead.status === status 
                        ? statusColors[status] 
                        : 'bg-[#1f1c13] text-[#AEACA1] hover:bg-[#AEACA1]/10'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-sm font-medium text-[#AEACA1] mb-2">Notes</p>
              
              {/* Add Note */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 bg-[#1f1c13] border border-[#AEACA1]/20 rounded text-white text-sm placeholder-[#AEACA1] focus:outline-none focus:border-[#CCAA4C]"
                  onKeyDown={(e) => e.key === 'Enter' && addNote()}
                />
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="px-3 py-2 bg-[#CCAA4C] text-[#353535] rounded font-bold text-sm hover:bg-[#CCAA4C]/80 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(notes[selectedLead.id] || []).map(note => (
                  <div key={note.id} className="bg-[#1f1c13] rounded p-3">
                    <p className="text-white text-sm">{note.note}</p>
                    <p className="text-[#AEACA1] text-xs mt-1">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {notes[selectedLead.id]?.length === 0 && (
                  <p className="text-[#AEACA1] text-sm text-center py-4">No notes yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
