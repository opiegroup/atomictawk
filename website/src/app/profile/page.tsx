'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient, useAuth } from '@/lib/supabase'
import { User, Upload, MessageSquare, Calendar, Camera, Save, Award, Trophy } from 'lucide-react'
import { BadgeGrid, Badge } from '@/components/badges'

interface ActivityStats {
  uploads_count: number
  comments_count: number
  last_active_at: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setAvatarUrl(profile.avatar_url || '')
      fetchStats()
      fetchBadges()
    }
  }, [profile])

  const fetchStats = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { data } = await (supabase.rpc as any)('get_user_activity_stats')
    if (data) {
      setStats(data as ActivityStats)
    }
  }

  const fetchBadges = async () => {
    const supabase = getSupabaseClient()
    if (!supabase || !user) return
    const { data } = await (supabase.rpc as any)('get_user_badges', { p_user_id: user.id })
    if (data) {
      setBadges(data as Badge[])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    const supabase = getSupabaseClient()
    if (!supabase) return
    const { error } = await (supabase.rpc as any)('update_own_profile', {
      p_display_name: displayName || null,
      p_avatar_url: avatarUrl || null
    })

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    }

    setSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const supabase = getSupabaseClient()
    if (!supabase) return
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' })
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    setAvatarUrl(publicUrl)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-500">Loading...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Your Profile</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <Upload className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.uploads_count || 0}</p>
            <p className="text-zinc-400 text-sm">Uploads</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <MessageSquare className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.comments_count || 0}</p>
            <p className="text-zinc-400 text-sm">Comments</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <Award className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{badges.length}</p>
            <p className="text-zinc-400 text-sm">Badges</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
            <Calendar className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">
              {stats?.last_active_at 
                ? new Date(stats.last_active_at).toLocaleDateString() 
                : 'Never'}
            </p>
            <p className="text-zinc-400 text-sm">Last Active</p>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-white">Honour Badges</h2>
            </div>
            <Link 
              href="/community/wall-of-honour" 
              className="text-xs text-amber-500 hover:underline"
            >
              View Wall of Honour →
            </Link>
          </div>
          <BadgeGrid badges={badges} emptyMessage="Start commenting to earn your first badge!" />
        </div>

        {/* Profile Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-zinc-600" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors">
                <Camera className="w-4 h-4 text-black" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-white font-medium">{profile.display_name || 'No name set'}</p>
              <p className="text-zinc-400 text-sm">{user.email}</p>
              <p className="text-zinc-500 text-xs mt-1 capitalize">
                Role: {profile.role} • Status: {profile.status}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="https://..."
              />
              <p className="text-zinc-500 text-xs mt-1">Or upload an image using the camera icon above</p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Member Since */}
        <p className="text-center text-zinc-500 text-sm mt-6">
          Member since {new Date(profile.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
