'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/supabase'
import { Ban } from 'lucide-react'

export default function AccountSuspendedPage() {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Account {profile?.status}</h1>
          <p className="text-zinc-400 mb-6">
            {profile?.status === 'banned' 
              ? 'Your account has been permanently banned. If you believe this is a mistake, please contact support.'
              : 'Your account has been temporarily suspended. Please contact support for more information.'}
          </p>
          
          <div className="space-y-3">
            <a
              href="mailto:support@atomictawk.com"
              className="block w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </a>
            <button
              onClick={handleSignOut}
              className="w-full py-3 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>

          <p className="mt-6 text-zinc-500 text-sm">
            <Link href="/" className="hover:text-zinc-400">
              Return to homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
