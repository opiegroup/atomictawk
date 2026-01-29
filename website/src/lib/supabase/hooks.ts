'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from './client'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserRole } from './types'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    setProfile(data)
    setLoading(false)
  }

  return { user, profile, loading }
}

export function useRole() {
  const { profile, loading } = useUser()

  const isGod = profile?.role === 'god'
  const isAdmin = profile?.role === 'god' || profile?.role === 'admin'
  const isSales = profile?.role === 'god' || profile?.role === 'sales'
  const isUser = !!profile

  const hasRole = useCallback((roles: UserRole[]) => {
    if (!profile) return false
    return roles.includes(profile.role)
  }, [profile])

  return {
    role: profile?.role,
    isGod,
    isAdmin,
    isSales,
    isUser,
    hasRole,
    loading,
  }
}

export function useAuth() {
  const { user, profile, loading } = useUser()
  
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createClient()
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!supabase) return { data: null, error: new Error('Not on client') }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })
    return { data, error }
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { data: null, error: new Error('Not on client') }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // Update last active on login
    if (data.user) {
      await supabase.rpc('update_last_active')
    }
    
    return { data, error }
  }, [supabase])

  const signOut = useCallback(async () => {
    if (!supabase) return { error: new Error('Not on client') }
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [supabase])

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { data: null, error: new Error('Not on client') }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }, [supabase])

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) return { data: null, error: new Error('Not on client') }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  }, [supabase])

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }
}
