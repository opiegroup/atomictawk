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
  X,
  Gamepad2,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  RefreshCw
} from 'lucide-react'

interface NewsletterSubscriber {
  id: string
  email: string
  user_id: string | null
  subscribed_to: string[]
  status: string
  is_game_registered: boolean
  game_display_name: string | null
  source: string | null
  verified: boolean
  created_at: string
  updated_at: string
}

type TabType = 'leads' | 'email' | 'game'

export default function LeadsPage() {
  const { isSales, isGod, isAdmin } = useRole()
  const { user } = useUser()
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('leads')
  
  // Leads state
  const [leads, setLeads] = useState<Lead[]>([])
  const [notes, setNotes] = useState<{ [leadId: string]: LeadNote[] }>({})
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [newNote, setNewNote] = useState('')
  
  // Newsletter state
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [subscriberFilter, setSubscriberFilter] = useState<string>('all')
  const [subscriberSearch, setSubscriberSearch] = useState('')
  
  // Game registrations state
  const [gameRegistrations, setGameRegistrations] = useState<NewsletterSubscriber[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeads()
    } else if (activeTab === 'email') {
      fetchSubscribers()
    } else if (activeTab === 'game') {
      fetchGameRegistrations()
    }
  }, [activeTab])

  const fetchLeads = async () => {
    setLoading(true)
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

  const fetchSubscribers = async () => {
    setLoading(true)
    const supabase = getSupabaseClient()
    if (!supabase) return
    
    const { data, error } = await (supabase as any)
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSubscribers(data)
    }
    setLoading(false)
  }

  const fetchGameRegistrations = async () => {
    setLoading(true)
    const supabase = getSupabaseClient()
    if (!supabase) return
    
    const { data, error } = await (supabase as any)
      .from('newsletter_subscribers')
      .select('*')
      .eq('is_game_registered', true)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setGameRegistrations(data)
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

  const updateSubscriberStatus = async (subscriberId: string, status: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    
    await (supabase as any)
      .from('newsletter_subscribers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', subscriberId)
    
    setSubscribers(prev => prev.map(s => 
      s.id === subscriberId ? { ...s, status } : s
    ))
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

  const exportSubscribers = () => {
    const data = activeTab === 'game' ? gameRegistrations : subscribers
    const csv = [
      ['Email', 'Display Name', 'Subscriptions', 'Status', 'Game Registered', 'Source', 'Created'],
      ...data.map(s => [
        s.email,
        s.game_display_name || '',
        (s.subscribed_to || []).join('; '),
        s.status,
        s.is_game_registered ? 'Yes' : 'No',
        s.source || '',
        new Date(s.created_at).toISOString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab === 'game' ? 'game-registrations' : 'subscribers'}-${new Date().toISOString().split('T')[0]}.csv`
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

  const filteredSubscribers = subscribers.filter(sub => {
    if (subscriberFilter !== 'all' && sub.status !== subscriberFilter) return false
    if (subscriberSearch && !sub.email.toLowerCase().includes(subscriberSearch.toLowerCase())) return false
    return true
  })

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

  if (!isSales && !isGod && !isAdmin) {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-[#CCAA4C]" />
            Leads & Subscriptions
          </h1>
          <p className="text-[#AEACA1] mt-1">
            Manage leads, email subscriptions, and game registrations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'leads', label: 'Sales Leads', icon: Target, count: leads.length },
          { id: 'email', label: 'Email Subscriptions', icon: Mail, count: subscribers.length },
          { id: 'game', label: 'Game Registrations', icon: Gamepad2, count: gameRegistrations.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-3 font-bold uppercase text-sm tracking-wider border-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-[#CCAA4C] border-[#CCAA4C] text-[#1a1a1a]'
                : 'bg-transparent border-[#353535] text-[#888] hover:border-[#CCAA4C]/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`ml-1 px-2 py-0.5 text-xs rounded ${
              activeTab === tab.id ? 'bg-[#1a1a1a]/20' : 'bg-[#353535]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Leads Tab Content */}
      {activeTab === 'leads' && (
        <>
          {/* Export Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={exportLeads}
              className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#353535] rounded font-bold text-sm hover:bg-[#CCAA4C]/80 transition-colors"
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
                <div className="p-8 text-center text-[#AEACA1]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading leads...
                </div>
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
        </>
      )}

      {/* Email Subscriptions Tab */}
      {activeTab === 'email' && (
        <>
          {/* Filters & Export */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type="text"
                  placeholder="Search email..."
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#252525] border border-[#353535] rounded text-white text-sm focus:border-[#CCAA4C] focus:outline-none w-64"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={subscriberFilter}
                onChange={(e) => setSubscriberFilter(e.target.value)}
                className="px-3 py-2 bg-[#252525] border border-[#353535] rounded text-white text-sm focus:border-[#CCAA4C] focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="bounced">Bounced</option>
              </select>
              
              <button
                onClick={fetchSubscribers}
                className="p-2 text-[#888] hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={exportSubscribers}
              className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#353535] rounded font-bold text-sm hover:bg-[#CCAA4C]/80 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#353535] rounded-lg p-4">
              <p className="text-2xl font-bold text-white">{subscribers.length}</p>
              <p className="text-sm text-[#AEACA1]">Total Subscribers</p>
            </div>
            <div className="bg-[#353535] rounded-lg p-4">
              <p className="text-2xl font-bold text-green-400">{subscribers.filter(s => s.status === 'active').length}</p>
              <p className="text-sm text-[#AEACA1]">Active</p>
            </div>
            <div className="bg-[#353535] rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-400">{subscribers.filter(s => s.is_game_registered).length}</p>
              <p className="text-sm text-[#AEACA1]">Game Registered</p>
            </div>
            <div className="bg-[#353535] rounded-lg p-4">
              <p className="text-2xl font-bold text-red-400">{subscribers.filter(s => s.status === 'unsubscribed').length}</p>
              <p className="text-sm text-[#AEACA1]">Unsubscribed</p>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-[#353535] rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#AEACA1]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading subscribers...
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="p-8 text-center text-[#AEACA1]">No subscribers found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#252525]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Subscriptions</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Game</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#AEACA1]/10">
                  {filteredSubscribers.map(sub => (
                    <tr key={sub.id} className="hover:bg-[#AEACA1]/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#CCAA4C]" />
                          <span className="text-white">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(sub.subscribed_to || []).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-[#CCAA4C]/20 text-[#CCAA4C] text-[10px] font-bold uppercase rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#AEACA1]">{sub.source || '-'}</td>
                      <td className="px-4 py-3">
                        {sub.is_game_registered ? (
                          <span className="flex items-center gap-1 text-purple-400 text-sm">
                            <Gamepad2 className="w-4 h-4" />
                            {sub.game_display_name || 'Yes'}
                          </span>
                        ) : (
                          <span className="text-[#666]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          sub.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          sub.status === 'unsubscribed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#AEACA1]">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {sub.status === 'active' ? (
                            <button
                              onClick={() => updateSubscriberStatus(sub.id, 'unsubscribed')}
                              className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                              title="Unsubscribe"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateSubscriberStatus(sub.id, 'active')}
                              className="p-1 text-green-400 hover:bg-green-500/10 rounded"
                              title="Reactivate"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Game Registrations Tab */}
      {activeTab === 'game' && (
        <>
          {/* Export */}
          <div className="flex justify-end mb-4">
            <button
              onClick={exportSubscribers}
              className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#353535] rounded font-bold text-sm hover:bg-[#CCAA4C]/80 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#353535] rounded-lg p-4">
              <p className="text-2xl font-bold text-white">{gameRegistrations.length}</p>
              <p className="text-sm text-[#AEACA1]">Total Registrations</p>
            </div>
            <div className="bg-[#353535] rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-400">{gameRegistrations.filter(g => g.game_display_name).length}</p>
              <p className="text-sm text-[#AEACA1]">With Display Name</p>
            </div>
            <div className="bg-[#353535] rounded-lg p-4">
              <p className="text-2xl font-bold text-green-400">{gameRegistrations.filter(g => g.status === 'active').length}</p>
              <p className="text-sm text-[#AEACA1]">Active Players</p>
            </div>
          </div>

          {/* Game Registrations Table */}
          <div className="bg-[#353535] rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#AEACA1]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading registrations...
              </div>
            ) : gameRegistrations.length === 0 ? (
              <div className="p-8 text-center text-[#AEACA1]">
                <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No game registrations yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-[#252525]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Display Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-[#AEACA1]">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#AEACA1]/10">
                  {gameRegistrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-[#AEACA1]/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-bold">{reg.game_display_name || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#AEACA1]">{reg.email}</td>
                      <td className="px-4 py-3 text-sm text-[#AEACA1]">{reg.source || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          reg.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#AEACA1]">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
