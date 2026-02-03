import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { BadgeDisplay } from '@/components/badges'
import { Trophy, Medal, Star, Users, Award } from 'lucide-react'
import Link from 'next/link'

interface LeaderboardEntry {
  user_id: string
  display_name: string
  avatar_url: string | null
  badge_count: number
  highest_tier: string
  badges: Array<{ icon: string; name: string; tier: string }>
}

interface BadgeDefinition {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  tier: string
  category: string
  color: string
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_badge_leaderboard', { p_limit: 20 })
  if (error) {
    console.error('Leaderboard error:', error)
    return []
  }
  return data || []
}

async function getAllBadges(): Promise<BadgeDefinition[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) {
    console.error('Badges error:', error)
    return []
  }
  return data || []
}

const tierOrder = ['legendary', 'platinum', 'gold', 'silver', 'bronze', 'special']
const tierLabels: Record<string, string> = {
  legendary: '🏆 Legendary',
  platinum: '💎 Platinum',
  gold: '🥇 Gold',
  silver: '🥈 Silver',
  bronze: '🥉 Bronze',
  special: '⭐ Special',
}

export default async function WallOfHonourPage() {
  const [leaderboard, allBadges] = await Promise.all([
    getLeaderboard(),
    getAllBadges()
  ])

  // Group badges by tier
  const badgesByTier = allBadges.reduce((acc, badge) => {
    const tier = badge.tier || 'special'
    if (!acc[tier]) acc[tier] = []
    acc[tier].push(badge)
    return acc
  }, {} as Record<string, BadgeDefinition[]>)

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-[#252219] to-[#1a1a1a] border-b-4 border-[#CCAA4C]">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-[#CCAA4C]/20 border-4 border-[#CCAA4C] rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-[#CCAA4C]" />
            </div>
          </div>
          <h1 
            className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4"
            style={{ fontFamily: 'var(--font-oswald)' }}
          >
            Wall of Honour
          </h1>
          <p className="text-[#AEACA1] max-w-xl mx-auto">
            This is not social media. This is <span className="text-[#CCAA4C] font-bold">Man Cave Culture</span>.
            <br />
            Recognising those who carry the culture.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Leaderboard */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-[#CCAA4C]" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-white" style={{ fontFamily: 'var(--font-oswald)' }}>
              Top Contributors
            </h2>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="bg-[#252219] border-2 border-[#353535] rounded p-8 text-center">
              <Medal className="w-12 h-12 mx-auto mb-4 text-[#AEACA1]/30" />
              <p className="text-[#AEACA1]">No badges awarded yet. Be the first!</p>
              <Link href="/community" className="inline-block mt-4 px-6 py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-sm">
                Join the Community
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.user_id}
                  className={`
                    bg-[#252219] border-2 rounded p-4 flex items-center gap-4
                    ${index === 0 ? 'border-[#CCAA4C] bg-[#CCAA4C]/5' : 
                      index === 1 ? 'border-slate-400' : 
                      index === 2 ? 'border-amber-600' : 
                      'border-[#353535]'}
                  `}
                >
                  {/* Rank */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-black text-lg
                    ${index === 0 ? 'bg-[#CCAA4C] text-[#1a1a1a]' : 
                      index === 1 ? 'bg-slate-400 text-[#1a1a1a]' : 
                      index === 2 ? 'bg-amber-600 text-[#1a1a1a]' : 
                      'bg-[#353535] text-white'}
                  `}>
                    {index + 1}
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#353535] overflow-hidden">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#CCAA4C] font-bold text-lg">
                        {entry.display_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  
                  {/* Name & Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-white truncate">{entry.display_name || 'Anonymous'}</h3>
                    <p className="text-xs text-[#AEACA1]">{entry.badge_count} badge{entry.badge_count !== 1 ? 's' : ''}</p>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex gap-1 flex-wrap justify-end">
                    {entry.badges?.slice(0, 6).map((badge, i) => (
                      <span key={i} className="text-xl" title={badge.name}>
                        {badge.icon}
                      </span>
                    ))}
                    {entry.badges && entry.badges.length > 6 && (
                      <span className="text-xs text-[#666]">+{entry.badges.length - 6}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* All Badges */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-[#CCAA4C]" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-white" style={{ fontFamily: 'var(--font-oswald)' }}>
              Honour Badges
            </h2>
          </div>
          <p className="text-[#AEACA1] mb-8 max-w-2xl">
            Badges are awarded for commenting, contributing to articles, posting helpful advice, 
            sharing builds, and consistent participation. No influencers. No vanity points. Only earned status.
          </p>
          
          <div className="space-y-8">
            {tierOrder.map(tier => {
              const badges = badgesByTier[tier]
              if (!badges || badges.length === 0) return null
              
              return (
                <div key={tier}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#CCAA4C] mb-4 flex items-center gap-2">
                    {tierLabels[tier] || tier}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map(badge => (
                      <div 
                        key={badge.id}
                        className="bg-[#252219] border-2 border-[#353535] rounded p-4 flex gap-4 hover:border-[#CCAA4C]/50 transition-colors"
                      >
                        <div className="text-4xl">{badge.icon}</div>
                        <div>
                          <h4 className="font-bold text-white">{badge.name}</h4>
                          <p className="text-xs text-[#AEACA1] mt-1 line-clamp-2">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center bg-[#252219] border-4 border-[#CCAA4C] p-8 rounded">
          <h3 className="text-xl font-black uppercase text-white mb-2" style={{ fontFamily: 'var(--font-oswald)' }}>
            Speak up. Build something. Earn your badge.
          </h3>
          <p className="text-[#AEACA1] mb-6">
            Join the conversation and become part of Man Cave Culture.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/community" 
              className="px-6 py-3 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-sm tracking-wider hover:bg-[#CCAA4C]/80 transition-colors"
            >
              Visit Community
            </Link>
            <Link 
              href="/shows" 
              className="px-6 py-3 bg-[#353535] text-white font-bold uppercase text-sm tracking-wider hover:bg-[#454545] transition-colors"
            >
              Browse Content
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
