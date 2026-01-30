'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Gamepad2, Radio, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useAuth, getSupabaseClient } from '@/lib/supabase'

interface NewsletterPopupProps {
  isOpen: boolean
  onClose: () => void
  source?: string
  showGameRegistration?: boolean
  onSuccess?: (subscriberId: string) => void
}

const STORAGE_KEY = 'atomic_tawk_subscriber'

export function NewsletterPopup({ 
  isOpen, 
  onClose, 
  source = 'popup',
  showGameRegistration = false,
  onSuccess
}: NewsletterPopupProps) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [registerForGame, setRegisterForGame] = useState(showGameRegistration)
  const [subscriptions, setSubscriptions] = useState({
    general: true,
    broadcasts: false,
    gaming: showGameRegistration,
    deals: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill email if logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  // Check if already subscribed
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.email) setEmail(data.email)
        if (data.displayName) setDisplayName(data.displayName)
      } catch {}
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error('Not connected')

      // Get selected subscriptions
      const subscribedTo = Object.entries(subscriptions)
        .filter(([_, v]) => v)
        .map(([k]) => k)

      // Call subscribe function
      const { data, error: subError } = await (supabase as any).rpc('subscribe_newsletter', {
        p_email: email.toLowerCase(),
        p_subscribed_to: subscribedTo,
        p_source: source,
        p_game_display_name: registerForGame ? displayName : null,
        p_is_game_registered: registerForGame,
      })

      if (subError) throw subError

      const result = data?.[0] || data

      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        id: result.subscriber_id,
        email: email.toLowerCase(),
        displayName: displayName || null,
        isGameRegistered: registerForGame,
        subscribedAt: new Date().toISOString(),
      }))

      setSuccess(true)
      
      if (onSuccess && result.subscriber_id) {
        onSuccess(result.subscriber_id)
      }

      // Close after delay
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (err: any) {
      console.error('Subscription error:', err)
      setError(err.message || 'Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1f1c13] border-4 border-[#CCAA4C] max-w-md w-full shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#AEACA1] hover:text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="bg-[#CCAA4C] px-6 py-4">
          <div className="flex items-center gap-3">
            <Radio className="w-8 h-8 text-[#1f1c13]" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#1f1c13]">
                {showGameRegistration ? 'Game Registration' : 'Stay Tuned'}
              </h2>
              <p className="text-sm text-[#1f1c13]/80">
                {showGameRegistration 
                  ? 'Register to save your progress'
                  : 'Join the Atomic Tawk broadcast network'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold text-[#E3E2D5] mb-2">You're In!</h3>
              <p className="text-[#AEACA1]">
                {registerForGame 
                  ? 'Game progress will be saved automatically.'
                  : 'Welcome to the Atomic Tawk community.'
                }
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#AEACA1] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#252219] border-2 border-[#353535] text-[#E3E2D5] placeholder:text-[#666] focus:border-[#CCAA4C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Display Name (for game) */}
              {registerForGame && (
                <div>
                  <label className="block text-xs font-bold uppercase text-[#AEACA1] mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your gamer tag"
                      className="w-full pl-11 pr-4 py-3 bg-[#252219] border-2 border-[#353535] text-[#E3E2D5] placeholder:text-[#666] focus:border-[#CCAA4C] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Game Registration Toggle */}
              {!showGameRegistration && (
                <label className="flex items-center gap-3 p-3 bg-[#252219] border border-[#353535] cursor-pointer hover:border-[#CCAA4C]/50">
                  <input
                    type="checkbox"
                    checked={registerForGame}
                    onChange={(e) => {
                      setRegisterForGame(e.target.checked)
                      setSubscriptions(s => ({ ...s, gaming: e.target.checked }))
                    }}
                    className="w-5 h-5 accent-[#CCAA4C]"
                  />
                  <div>
                    <span className="text-[#E3E2D5] font-bold">Register for Games</span>
                    <p className="text-xs text-[#AEACA1]">Save your progress in Man Cave Builder & more</p>
                  </div>
                </label>
              )}

              {/* Subscription Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[#AEACA1] mb-2">
                  What interests you?
                </label>
                
                {[
                  { key: 'general', label: 'General Updates', desc: 'News & announcements' },
                  { key: 'broadcasts', label: 'New Broadcasts', desc: 'Videos & shows' },
                  { key: 'gaming', label: 'Gaming', desc: 'Game updates & leaderboards' },
                  { key: 'deals', label: 'Store Deals', desc: 'Exclusive offers' },
                ].map(opt => (
                  <label 
                    key={opt.key}
                    className="flex items-center gap-3 p-2 hover:bg-[#252219] cursor-pointer rounded"
                  >
                    <input
                      type="checkbox"
                      checked={subscriptions[opt.key as keyof typeof subscriptions]}
                      onChange={(e) => setSubscriptions(s => ({ ...s, [opt.key]: e.target.checked }))}
                      className="w-4 h-4 accent-[#CCAA4C]"
                    />
                    <div className="flex-grow">
                      <span className="text-sm text-[#E3E2D5]">{opt.label}</span>
                      <span className="text-xs text-[#666] ml-2">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-4 bg-[#CCAA4C] text-[#1f1c13] font-black uppercase tracking-widest hover:bg-[#E3E2D5] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : registerForGame ? (
                  'Register & Subscribe'
                ) : (
                  'Subscribe'
                )}
              </button>

              {/* Fine Print */}
              <p className="text-[10px] text-[#666] text-center">
                No spam. Unsubscribe anytime. We respect your inbox like we respect a clean engine bay.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook to check subscription status
export function useNewsletterStatus() {
  const [status, setStatus] = useState<{
    isSubscribed: boolean
    isGameRegistered: boolean
    subscriberId: string | null
    email: string | null
    displayName: string | null
  }>({
    isSubscribed: false,
    isGameRegistered: false,
    subscriberId: null,
    email: null,
    displayName: null,
  })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setStatus({
          isSubscribed: true,
          isGameRegistered: data.isGameRegistered || false,
          subscriberId: data.id || null,
          email: data.email || null,
          displayName: data.displayName || null,
        })
      } catch {}
    }
  }, [])

  const clearStatus = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStatus({
      isSubscribed: false,
      isGameRegistered: false,
      subscriberId: null,
      email: null,
      displayName: null,
    })
  }

  return { ...status, clearStatus }
}
