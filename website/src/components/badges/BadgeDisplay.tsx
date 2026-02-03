'use client'

import { useState } from 'react'

export interface Badge {
  badge_id: string
  slug: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary' | 'special'
  category: 'rank' | 'special' | 'achievement'
  color: string
  awarded_at: string
  is_featured: boolean
  reason?: string
}

interface BadgeDisplayProps {
  badge: Badge
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

const tierColors: Record<string, { bg: string; border: string; glow: string }> = {
  bronze: { bg: 'bg-amber-900/30', border: 'border-amber-700', glow: '' },
  silver: { bg: 'bg-slate-400/20', border: 'border-slate-400', glow: '' },
  gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', glow: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]' },
  platinum: { bg: 'bg-slate-200/20', border: 'border-slate-200', glow: 'shadow-[0_0_15px_rgba(226,232,240,0.3)]' },
  legendary: { bg: 'bg-[#CCAA4C]/20', border: 'border-[#CCAA4C]', glow: 'shadow-[0_0_20px_rgba(204,170,76,0.4)]' },
  special: { bg: 'bg-purple-500/20', border: 'border-purple-500', glow: '' },
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl',
}

export function BadgeDisplay({ badge, size = 'md', showTooltip = true }: BadgeDisplayProps) {
  const [showDetails, setShowDetails] = useState(false)
  const colors = tierColors[badge.tier] || tierColors.bronze
  
  return (
    <div className="relative inline-block">
      <div
        className={`
          ${sizeClasses[size]} ${colors.bg} ${colors.border} ${colors.glow}
          border-2 rounded-full flex items-center justify-center cursor-pointer
          transition-all hover:scale-110 hover:brightness-110
        `}
        onMouseEnter={() => showTooltip && setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        title={badge.name}
      >
        <span>{badge.icon}</span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && showDetails && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#252219] border-2 border-[#CCAA4C] rounded shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{badge.icon}</span>
            <div>
              <h4 className="font-bold text-white text-sm">{badge.name}</h4>
              <span className={`text-[10px] uppercase tracking-wider ${
                badge.tier === 'legendary' ? 'text-[#CCAA4C]' : 
                badge.tier === 'gold' ? 'text-yellow-400' :
                badge.tier === 'platinum' ? 'text-slate-300' :
                badge.tier === 'silver' ? 'text-slate-400' :
                badge.tier === 'special' ? 'text-purple-400' :
                'text-amber-600'
              }`}>
                {badge.tier} {badge.category}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#AEACA1] leading-relaxed">{badge.description}</p>
          {badge.reason && (
            <p className="mt-2 text-xs text-[#CCAA4C] italic">"{badge.reason}"</p>
          )}
          <p className="mt-2 text-[10px] text-[#666]">
            Awarded {new Date(badge.awarded_at).toLocaleDateString()}
          </p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#CCAA4C]" />
        </div>
      )}
    </div>
  )
}

interface BadgeListProps {
  badges: Badge[]
  size?: 'sm' | 'md' | 'lg'
  maxDisplay?: number
}

export function BadgeList({ badges, size = 'sm', maxDisplay = 5 }: BadgeListProps) {
  const displayBadges = badges.slice(0, maxDisplay)
  const remaining = badges.length - maxDisplay
  
  if (badges.length === 0) return null
  
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {displayBadges.map(badge => (
        <BadgeDisplay key={badge.badge_id} badge={badge} size={size} />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-[#666] ml-1">+{remaining} more</span>
      )}
    </div>
  )
}

interface BadgeGridProps {
  badges: Badge[]
  emptyMessage?: string
}

export function BadgeGrid({ badges, emptyMessage = "No badges yet" }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-[#666]">
        <span className="text-4xl mb-2 block opacity-30">🎖️</span>
        <p>{emptyMessage}</p>
      </div>
    )
  }
  
  // Group by category
  const rankBadges = badges.filter(b => b.category === 'rank')
  const specialBadges = badges.filter(b => b.category === 'special' || b.category === 'achievement')
  
  return (
    <div className="space-y-6">
      {rankBadges.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCAA4C] mb-3">Rank</h4>
          <div className="flex flex-wrap gap-3">
            {rankBadges.map(badge => (
              <BadgeDisplay key={badge.badge_id} badge={badge} size="lg" />
            ))}
          </div>
        </div>
      )}
      
      {specialBadges.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#CCAA4C] mb-3">Special Honours</h4>
          <div className="flex flex-wrap gap-3">
            {specialBadges.map(badge => (
              <BadgeDisplay key={badge.badge_id} badge={badge} size="lg" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
