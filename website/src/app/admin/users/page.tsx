'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient, useRole, Profile, UserRole, UserStatus } from '@/lib/supabase'
import { 
  Users, 
  Shield, 
  Ban, 
  AlertTriangle, 
  Trash2, 
  UserCog,
  Search,
  ChevronDown
} from 'lucide-react'

export default function UsersPage() {
  const { isGod, isAdmin } = useRole()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUsers(data)
    }
    setLoading(false)
  }

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { error } = await (supabase.rpc as any)('set_user_status', {
      p_user_id: userId,
      p_status: newStatus
    })

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      setShowModal(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!isGod) return
    
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { error } = await (supabase.rpc as any)('set_user_role', {
      p_user_id: userId,
      p_role: newRole
    })

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setShowModal(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!isGod) return
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return

    const supabase = getSupabaseClient()
    if (!supabase) return
    const { error } = await (supabase.rpc as any)('delete_user', {
      p_user_id: userId
    })

    if (!error) {
      setUsers(users.filter(u => u.id !== userId))
      setShowModal(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !search || 
      user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const statusColors: Record<UserStatus, string> = {
    active: 'bg-green-500/20 text-green-400',
    warned: 'bg-yellow-500/20 text-yellow-400',
    suspended: 'bg-orange-500/20 text-orange-400',
    banned: 'bg-red-500/20 text-red-400'
  }

  const roleColors: Record<UserRole, string> = {
    god: 'bg-purple-500/20 text-purple-400',
    admin: 'bg-blue-500/20 text-blue-400',
    sales: 'bg-green-500/20 text-green-400',
    user: 'bg-zinc-500/20 text-zinc-400'
  }

  if (!isAdmin && !isGod) {
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
            <Users className="w-8 h-8 text-[#CCAA4C]" />
            User Management
          </h1>
          <p className="text-[#AEACA1] mt-1">
            {isGod ? 'Full access: manage roles, statuses, and delete users' : 'Manage user statuses only'}
          </p>
        </div>
        <div className="text-[#AEACA1]">
          {users.length} total users
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#353535] rounded-lg p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AEACA1]" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1f1c13] border border-[#AEACA1]/20 rounded-lg text-white placeholder-[#AEACA1] focus:outline-none focus:border-[#CCAA4C]"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-[#1f1c13] border border-[#AEACA1]/20 rounded-lg text-white focus:outline-none focus:border-[#CCAA4C]"
        >
          <option value="all">All Roles</option>
          <option value="god">God</option>
          <option value="admin">Admin</option>
          <option value="sales">Sales</option>
          <option value="user">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-[#1f1c13] border border-[#AEACA1]/20 rounded-lg text-white focus:outline-none focus:border-[#CCAA4C]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="warned">Warned</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#353535] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#AEACA1]">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-[#AEACA1]">No users found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#AEACA1]/20">
                <th className="text-left p-4 text-[#AEACA1] font-medium text-sm uppercase">User</th>
                <th className="text-left p-4 text-[#AEACA1] font-medium text-sm uppercase">Role</th>
                <th className="text-left p-4 text-[#AEACA1] font-medium text-sm uppercase">Status</th>
                <th className="text-left p-4 text-[#AEACA1] font-medium text-sm uppercase">Last Active</th>
                <th className="text-right p-4 text-[#AEACA1] font-medium text-sm uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#AEACA1]/10 hover:bg-[#AEACA1]/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#CCAA4C]/20 flex items-center justify-center">
                        <span className="text-[#CCAA4C] font-bold">
                          {user.display_name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.display_name || 'Unnamed'}</p>
                        <p className="text-[#AEACA1] text-sm truncate max-w-[200px]">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#AEACA1] text-sm">
                    {user.last_active_at 
                      ? new Date(user.last_active_at).toLocaleDateString() 
                      : 'Never'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => { setSelectedUser(user); setShowModal(true) }}
                      className="px-3 py-1 bg-[#CCAA4C] text-[#353535] rounded font-bold text-sm hover:bg-[#CCAA4C]/80 transition-colors"
                    >
                      <UserCog className="w-4 h-4 inline mr-1" />
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Management Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#353535] rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Manage User</h2>
            
            <div className="mb-6">
              <p className="text-white font-medium">{selectedUser.display_name || 'Unnamed'}</p>
              <p className="text-[#AEACA1] text-sm">{selectedUser.id}</p>
            </div>

            {/* Status Actions */}
            <div className="mb-6">
              <label className="text-sm font-medium text-[#AEACA1] mb-2 block">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {(['active', 'warned', 'suspended', 'banned'] as UserStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedUser.id, status)}
                    disabled={selectedUser.status === status}
                    className={`px-3 py-2 rounded text-sm font-bold uppercase transition-colors disabled:opacity-50 ${
                      selectedUser.status === status 
                        ? statusColors[status] 
                        : 'bg-[#1f1c13] text-[#AEACA1] hover:bg-[#AEACA1]/10'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Actions (God only) */}
            {isGod && (
              <div className="mb-6">
                <label className="text-sm font-medium text-[#AEACA1] mb-2 block">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['user', 'sales', 'admin', 'god'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(selectedUser.id, role)}
                      disabled={selectedUser.role === role}
                      className={`px-3 py-2 rounded text-sm font-bold uppercase transition-colors disabled:opacity-50 ${
                        selectedUser.role === role 
                          ? roleColors[role] 
                          : 'bg-[#1f1c13] text-[#AEACA1] hover:bg-[#AEACA1]/10'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delete (God only) */}
            {isGod && (
              <div className="mb-6 pt-4 border-t border-[#AEACA1]/20">
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded font-bold text-sm hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User Permanently
                </button>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-2 bg-[#AEACA1]/20 text-[#AEACA1] rounded font-bold text-sm hover:bg-[#AEACA1]/30 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
