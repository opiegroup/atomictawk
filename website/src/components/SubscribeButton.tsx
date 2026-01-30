'use client'

import { useState } from 'react'
import { NewsletterPopup, useNewsletterStatus } from './NewsletterPopup'
import { CheckCircle } from 'lucide-react'

interface SubscribeButtonProps {
  children?: React.ReactNode
  className?: string
  source?: string
  showGameRegistration?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  onSuccess?: (subscriberId: string) => void
}

export function SubscribeButton({
  children,
  className = '',
  source = 'button',
  showGameRegistration = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onSuccess,
}: SubscribeButtonProps) {
  const [showPopup, setShowPopup] = useState(false)
  const { isSubscribed, isGameRegistered } = useNewsletterStatus()

  // If already subscribed (and not requiring game registration, or already game registered)
  const alreadyComplete = isSubscribed && (!showGameRegistration || isGameRegistered)

  const baseStyles = 'font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2'
  
  const variantStyles = {
    primary: 'bg-[#CCAA4C] text-[#1f1c13] hover:bg-[#E3E2D5]',
    secondary: 'bg-[#252219] text-[#CCAA4C] border-2 border-[#CCAA4C] hover:bg-[#CCAA4C] hover:text-[#1f1c13]',
    outline: 'bg-transparent text-[#E3E2D5] border-2 border-[#AEACA1] hover:border-[#CCAA4C] hover:text-[#CCAA4C]',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  if (alreadyComplete) {
    return (
      <div className={`${baseStyles} ${sizeStyles[size]} ${widthStyle} ${className} text-green-500 bg-green-500/10 border-2 border-green-500/30 cursor-default`}>
        <CheckCircle className="w-4 h-4" />
        {showGameRegistration ? 'Registered' : 'Subscribed'}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      >
        {children || (showGameRegistration ? 'Register to Play' : 'Subscribe')}
      </button>

      <NewsletterPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        source={source}
        showGameRegistration={showGameRegistration}
        onSuccess={(id) => {
          onSuccess?.(id)
        }}
      />
    </>
  )
}
