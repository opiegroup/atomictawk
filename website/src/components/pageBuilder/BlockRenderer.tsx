'use client'

import React, { useState, useEffect, useRef } from 'react'
import { PageBlock, THEME_COLORS, BlockStyling, BlockButton, ButtonsConfig } from '@/lib/pageBuilder'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Settings, Gamepad2, Trophy, Zap, Star, ShoppingBag, MessageSquare, 
  Users, Camera, Tag, Tv, Play, Radio, Headphones, Share2, Heart,
  AlertTriangle, Wrench, ChevronLeft, ChevronRight, FileText
} from 'lucide-react'
import { FeaturedContent } from '@/components/FeaturedContent'
import { LatestBroadcasts } from '@/components/LatestBroadcasts'

interface BlockRendererProps {
  block: PageBlock
  isEditing?: boolean
}

// Style wrapper for applying common styling to all blocks
function BlockStyleWrapper({ 
  styling, 
  buttons,
  buttonsConfig,
  isEditing,
  children 
}: { 
  styling?: BlockStyling
  buttons?: BlockButton[]
  buttonsConfig?: ButtonsConfig
  isEditing: boolean
  children: React.ReactNode 
}) {
  // Build inline styles
  const wrapperStyle: React.CSSProperties = {}
  
  // Background
  if (styling?.backgroundColor) {
    wrapperStyle.backgroundColor = styling.backgroundColor
  }
  if (styling?.backgroundGradient) {
    wrapperStyle.background = styling.backgroundGradient
  }
  if (styling?.backgroundImage && !styling?.backgroundVideo) {
    wrapperStyle.backgroundImage = `url(${styling.backgroundImage})`
    wrapperStyle.backgroundSize = 'cover'
    wrapperStyle.backgroundPosition = 'center'
  }
  
  // Text color
  if (styling?.textColor) {
    wrapperStyle.color = styling.textColor
  }

  // Build classes
  const classes: string[] = ['relative']
  
  // Padding
  const paddingMap = {
    none: 'py-0',
    small: 'py-4',
    medium: 'py-8',
    large: 'py-16',
    xlarge: 'py-24',
  }
  if (styling?.paddingTop) classes.push(paddingMap[styling.paddingTop]?.replace('py-', 'pt-') || '')
  if (styling?.paddingBottom) classes.push(paddingMap[styling.paddingBottom]?.replace('py-', 'pb-') || '')
  
  // Border radius
  const radiusMap = {
    none: '',
    small: 'rounded',
    medium: 'rounded-lg',
    large: 'rounded-2xl',
  }
  if (styling?.borderRadius) classes.push(radiusMap[styling.borderRadius] || '')
  
  // Frame styles
  const frameStyles: Record<string, string> = {
    none: '',
    solid: 'border-2',
    thick: 'border-4',
    industrial: 'border-4 shadow-[4px_4px_0px_0px]',
    double: 'border-4 outline outline-2 outline-offset-2',
    dashed: 'border-4 border-dashed',
  }
  if (styling?.frameStyle && styling.frameStyle !== 'none') {
    classes.push(frameStyles[styling.frameStyle] || '')
  }

  // Texture overlay class
  const textureClasses: Record<string, string> = {
    halftone: 'halftone-overlay',
    noise: 'noise-overlay',
    scanlines: 'crt-scanline',
    metal: 'metal-overlay',
    paper: 'paper-overlay',
  }

  // Button rendering helper with positioning
  const renderButtons = () => {
    if (!buttons || buttons.length === 0) return null
    
    const config = buttonsConfig || { position: 'bottom-center', spacing: 'normal', direction: 'horizontal' }
    
    const getButtonClasses = (style: string, size: string) => {
      const baseClasses = 'font-bold uppercase tracking-widest transition-all border-4 inline-flex items-center gap-2'
      const sizeClasses = {
        small: 'px-4 py-2 text-xs',
        medium: 'px-6 py-3 text-sm',
        large: 'px-8 py-4 text-base',
      }
      const styleClasses = {
        primary: 'bg-[#CCAA4C] border-[#CCAA4C] text-[#1a1a1a] hover:bg-[#FF6B35] hover:border-[#FF6B35] hover:text-white',
        secondary: 'bg-[#353535] border-[#353535] text-white hover:bg-[#CCAA4C] hover:border-[#CCAA4C] hover:text-[#1a1a1a]',
        outline: 'bg-transparent border-[#CCAA4C] text-[#CCAA4C] hover:bg-[#CCAA4C] hover:text-[#1a1a1a]',
        ghost: 'bg-transparent border-transparent text-[#CCAA4C] hover:bg-[#CCAA4C]/10',
      }
      return `${baseClasses} ${sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium} ${styleClasses[style as keyof typeof styleClasses] || styleClasses.primary}`
    }

    // Position classes for absolute positioning within block
    const positionClasses: Record<string, string> = {
      'bottom-center': 'absolute bottom-6 left-1/2 -translate-x-1/2',
      'bottom-left': 'absolute bottom-6 left-6',
      'bottom-right': 'absolute bottom-6 right-6',
      'top-center': 'absolute top-6 left-1/2 -translate-x-1/2',
      'top-left': 'absolute top-6 left-6',
      'top-right': 'absolute top-6 right-6',
      'center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'inline': '', // No absolute positioning - flows with content
    }

    const spacingClasses = {
      tight: 'gap-2',
      normal: 'gap-4',
      wide: 'gap-6',
    }

    const directionClasses = {
      horizontal: 'flex-row flex-wrap',
      vertical: 'flex-col',
    }

    const containerClasses = `
      flex ${directionClasses[config.direction] || 'flex-row'} 
      ${spacingClasses[config.spacing] || 'gap-4'}
      ${positionClasses[config.position] || ''} 
      z-20
    `

    const containerStyle: React.CSSProperties = {}
    if (config.marginTop) containerStyle.marginTop = `${config.marginTop}px`
    if (config.marginBottom) containerStyle.marginBottom = `${config.marginBottom}px`

    // For inline position, render at the end of content
    if (config.position === 'inline') {
      return null // Will be handled differently
    }

    return (
      <div className={containerClasses} style={containerStyle}>
        {buttons.map((btn) => (
          isEditing ? (
            <span key={btn.id} className={getButtonClasses(btn.style, btn.size)}>
              {btn.icon && <span>{btn.icon}</span>}
              {btn.text}
            </span>
          ) : (
            <Link key={btn.id} href={btn.link || '/'} className={getButtonClasses(btn.style, btn.size)}>
              {btn.icon && <span>{btn.icon}</span>}
              {btn.text}
            </Link>
          )
        ))}
      </div>
    )
  }

  // Inline buttons (rendered after content)
  const renderInlineButtons = () => {
    if (!buttons || buttons.length === 0) return null
    const config = buttonsConfig || { position: 'bottom-center', spacing: 'normal', direction: 'horizontal' }
    if (config.position !== 'inline') return null

    const getButtonClasses = (style: string, size: string) => {
      const baseClasses = 'font-bold uppercase tracking-widest transition-all border-4 inline-flex items-center gap-2'
      const sizeClasses = {
        small: 'px-4 py-2 text-xs',
        medium: 'px-6 py-3 text-sm',
        large: 'px-8 py-4 text-base',
      }
      const styleClasses = {
        primary: 'bg-[#CCAA4C] border-[#CCAA4C] text-[#1a1a1a] hover:bg-[#FF6B35] hover:border-[#FF6B35] hover:text-white',
        secondary: 'bg-[#353535] border-[#353535] text-white hover:bg-[#CCAA4C] hover:border-[#CCAA4C] hover:text-[#1a1a1a]',
        outline: 'bg-transparent border-[#CCAA4C] text-[#CCAA4C] hover:bg-[#CCAA4C] hover:text-[#1a1a1a]',
        ghost: 'bg-transparent border-transparent text-[#CCAA4C] hover:bg-[#CCAA4C]/10',
      }
      return `${baseClasses} ${sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium} ${styleClasses[style as keyof typeof styleClasses] || styleClasses.primary}`
    }

    const spacingClasses = { tight: 'gap-2', normal: 'gap-4', wide: 'gap-6' }
    const directionClasses = { horizontal: 'flex-row flex-wrap', vertical: 'flex-col' }

    return (
      <div 
        className={`flex justify-center ${directionClasses[config.direction] || 'flex-row'} ${spacingClasses[config.spacing] || 'gap-4'} px-6 pb-6`}
        style={{ 
          marginTop: config.marginTop ? `${config.marginTop}px` : '24px',
          marginBottom: config.marginBottom ? `${config.marginBottom}px` : '0',
        }}
      >
        {buttons.map((btn) => (
          isEditing ? (
            <span key={btn.id} className={getButtonClasses(btn.style, btn.size)}>
              {btn.icon && <span>{btn.icon}</span>}
              {btn.text}
            </span>
          ) : (
            <Link key={btn.id} href={btn.link || '/'} className={getButtonClasses(btn.style, btn.size)}>
              {btn.icon && <span>{btn.icon}</span>}
              {btn.text}
            </Link>
          )
        ))}
      </div>
    )
  }

  const hasBackgroundMedia = styling?.backgroundImage || styling?.backgroundVideo

  return (
    <div 
      className={`${classes.join(' ')} overflow-hidden`}
      style={{
        ...wrapperStyle,
        borderColor: styling?.frameColor || '#CCAA4C',
        ['--shadow-color' as any]: styling?.frameColor || '#CCAA4C',
      }}
    >
      {/* Background Video */}
      {styling?.backgroundVideo && (
        <video
          src={styling.backgroundVideo}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      
      {/* Background overlay for images/videos */}
      {hasBackgroundMedia && (
        <div 
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: (styling?.backgroundOverlay ?? 50) / 100 }}
        />
      )}
      
      {/* Texture overlay */}
      {styling?.textureOverlay && styling.textureOverlay !== 'none' && (
        <div 
          className={`absolute inset-0 pointer-events-none ${textureClasses[styling.textureOverlay] || ''}`}
          style={{ opacity: (styling?.textureOpacity ?? 20) / 100 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
        {renderInlineButtons()}
      </div>

      {/* Positioned buttons (non-inline) */}
      {renderButtons()}
    </div>
  )
}

export function BlockRenderer({ block, isEditing = false }: BlockRendererProps) {
  if (!block.visible && !isEditing) return null

  const renderBlock = () => {
    switch (block.type) {
      // Atomic Tawk specific blocks
      case 'atomicHero':
        return <AtomicHeroBlock block={block} isEditing={isEditing} />
      case 'tickerBar':
        return <TickerBarBlock block={block} />
      case 'featureModuleGrid':
        return <FeatureModuleGridBlock block={block} isEditing={isEditing} />
      case 'atomicTVBanner':
        return <AtomicTVBannerBlock block={block} isEditing={isEditing} />
      case 'propagandaGrid':
        return <PropagandaGridBlock block={block} isEditing={isEditing} />
      case 'blokeScienceSlider':
        return <BlokeScienceSliderBlock block={block} />
      case 'broadcastList':
        return <BroadcastListBlock block={block} isEditing={isEditing} />
      case 'categoryIconGrid':
        return <CategoryIconGridBlock block={block} isEditing={isEditing} />
      case 'brandStatement':
        return <BrandStatementBlock block={block} />
      // Generic blocks
      case 'hero':
        return <HeroBlock block={block} isEditing={isEditing} />
      case 'richText':
        return <RichTextBlock block={block} />
      case 'ctaStrip':
        return <CTAStripBlock block={block} />
      case 'poster':
        return <PosterBlock block={block} />
      case 'video':
        return <VideoBlock block={block} />
      case 'divider':
        return <DividerBlock block={block} />
      case 'buttonGroup':
        return <ButtonGroupBlock block={block} isEditing={isEditing} />
      case 'communityFeed':
        return <CommunityFeedBlock block={block} isEditing={isEditing} />
      case 'productEmbed':
        return <ProductEmbedBlock block={block} isEditing={isEditing} />
      default:
        return (
          <div className="p-8 bg-[#252525] text-center">
            <p className="text-[#666]">Unknown block type: {block.type}</p>
          </div>
        )
    }
  }

  // Wrap with style wrapper to apply common styling + additional buttons
  return (
    <BlockStyleWrapper 
      styling={block.styling} 
      buttons={block.buttons}
      buttonsConfig={block.buttonsConfig}
      isEditing={isEditing}
    >
      {renderBlock()}
    </BlockStyleWrapper>
  )
}

// ============================================
// ATOMIC TAWK SPECIFIC BLOCKS
// ============================================

// ATOMIC HERO
function AtomicHeroBlock({ block, isEditing }: { block: PageBlock; isEditing: boolean }) {
  const { logoUrl, headline, subheadline, primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink, showDecorativeGears } = block.props

  const Wrapper = isEditing ? 'div' : Link

  // Check if block has custom background styling (video/image/color)
  const hasCustomBackground = block.styling?.backgroundVideo || block.styling?.backgroundImage || block.styling?.backgroundColor || block.styling?.backgroundGradient
  const bgClass = hasCustomBackground ? 'bg-transparent' : 'bg-[#E3E2D5]'
  
  // Get text color from styling or default
  const textColor = block.styling?.textColor || '#353535'
  const isLightText = textColor === '#FFFFFF' || textColor === '#ffffff' || textColor === 'white' || textColor === '#E3E2D5'

  return (
    <section className={`relative ${bgClass} py-16 md:py-24 border-b-8 border-[#353535] overflow-hidden`}>
      {!hasCustomBackground && <div className="absolute inset-0 halftone-overlay"></div>}
      
      {/* Decorative Gears */}
      {showDecorativeGears && (
        <>
          <Settings 
            className="absolute -bottom-10 -left-10 w-[200px] h-[200px] opacity-10 animate-spin-slow" 
            style={{ color: textColor }}
          />
          <Settings 
            className="absolute -top-10 -right-10 w-[150px] h-[150px] opacity-10 animate-spin-slow" 
            style={{ animationDirection: "reverse", color: textColor }}
          />
        </>
      )}

      <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Logo */}
        {logoUrl && (
          <Image
            src={logoUrl}
            alt="Atomic Tawk"
            width={400}
            height={300}
            className="mb-8 drop-shadow-2xl"
          />
        )}

        {/* Main Headline */}
        <h1 
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter uppercase mb-4 drop-shadow-md whitespace-pre-line"
          style={{ fontFamily: "var(--font-oswald), sans-serif", color: textColor }}
        >
          {headline}
        </h1>

        {/* Subtitle */}
        <div 
          className="px-8 py-2 mb-8 inline-block skew-x-[-12deg]"
          style={{ backgroundColor: isLightText ? '#353535' : textColor }}
        >
          <h2 
            className="text-lg md:text-2xl font-bold italic uppercase tracking-[0.2em] skew-x-[12deg]"
            style={{ fontFamily: "var(--font-oswald), sans-serif", color: isLightText ? 'white' : '#E3E2D5' }}
          >
            {subheadline}
          </h2>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-6">
          {primaryButtonText && (
            isEditing ? (
              <span 
                className="px-8 py-4 bg-[#CCAA4C] font-bold uppercase tracking-widest border-4"
                style={{ borderColor: isLightText ? 'white' : '#353535', color: '#353535' }}
              >
                {primaryButtonText}
              </span>
            ) : (
              <Link 
                href={primaryButtonLink || '#'} 
                className="px-8 py-4 bg-[#CCAA4C] font-bold uppercase tracking-widest border-4 hover:bg-[#FF6B35] hover:text-white transition-colors"
                style={{ borderColor: isLightText ? 'white' : '#353535', color: '#353535' }}
              >
                {primaryButtonText}
              </Link>
            )
          )}
          {secondaryButtonText && (
            isEditing ? (
              <span 
                className="px-8 py-4 bg-transparent font-bold uppercase tracking-widest border-4"
                style={{ borderColor: isLightText ? 'white' : '#353535', color: textColor }}
              >
                {secondaryButtonText}
              </span>
            ) : (
              <Link 
                href={secondaryButtonLink || '#'} 
                className="px-8 py-4 bg-transparent font-bold uppercase tracking-widest border-4 hover:bg-opacity-20 transition-colors"
                style={{ borderColor: isLightText ? 'white' : '#353535', color: textColor }}
              >
                {secondaryButtonText}
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  )
}

// TICKER BAR
function TickerBarBlock({ block }: { block: PageBlock }) {
  const { items } = block.props

  const iconMap: Record<string, any> = {
    bolt: Zap,
    warning: AlertTriangle,
    construction: Wrench,
    gaming: Gamepad2,
  }

  const allItems = [...(items || []), ...(items || [])]

  return (
    <div className="bg-[#353535] py-3 border-b-4 border-[#CCAA4C] overflow-hidden whitespace-nowrap">
      <div className="animate-marquee flex gap-20 items-center">
        {allItems.map((item: any, index: number) => {
          const Icon = iconMap[item.icon] || Zap
          return (
            <div
              key={index}
              className={`flex items-center gap-4 font-bold uppercase tracking-widest text-sm ${
                item.highlight ? "text-[#CCAA4C]" : "text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// FEATURE MODULE GRID
function FeatureModuleGridBlock({ block, isEditing }: { block: PageBlock; isEditing: boolean }) {
  const { modules } = block.props

  const accentColors: Record<string, { border: string; bg: string; text: string; badge: string }> = {
    orange: { border: 'border-[#FF6B35]', bg: 'bg-[#FF6B35]', text: 'text-[#FF6B35]', badge: 'bg-[#FF6B35] text-white' },
    gold: { border: 'border-[#CCAA4C]', bg: 'bg-[#CCAA4C]', text: 'text-[#CCAA4C]', badge: 'bg-[#CCAA4C] text-[#353535]' },
    green: { border: 'border-[#39FF14]', bg: 'bg-[#39FF14]', text: 'text-[#39FF14]', badge: 'bg-[#39FF14] text-[#353535]' },
  }

  const moduleIcons: Record<string, any> = {
    game: Gamepad2,
    store: ShoppingBag,
    community: MessageSquare,
    custom: Star,
  }

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(modules || []).map((module: any) => {
          const colors = accentColors[module.accentColor] || accentColors.gold
          const Icon = moduleIcons[module.type] || Star

          return (
            <div key={module.id} className={`relative overflow-hidden border-4 ${colors.border} bg-gradient-to-br from-[#353535] to-[#1f1c13]`}>
              {/* Badge */}
              <div className={`absolute top-0 right-0 px-4 py-1 ${colors.badge}`}>
                <span className="text-xs font-black uppercase tracking-widest">{module.badge}</span>
              </div>
              
              {/* Background Icons */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4">
                  <Icon className={`w-32 h-32 ${colors.text}`} />
                </div>
              </div>
              
              <div className="relative p-8">
                {/* Icon */}
                <div className={`w-20 h-20 ${colors.bg} flex items-center justify-center mb-6 border-4 border-[#CCAA4C]`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                
                {/* Title */}
                <h2 
                  className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {module.title}
                </h2>
                
                <p className={`${colors.text} font-bold uppercase text-sm tracking-widest mb-4`}>
                  {module.subtitle}
                </p>
                
                <p className="text-white/70 text-sm mb-6 max-w-md">
                  {module.description}
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {(module.features || []).map((feature: any, i: number) => (
                    <div 
                      key={i}
                      className="flex items-center gap-2 bg-white/10 px-3 py-1 border border-white/20"
                    >
                      <span>{feature.icon}</span>
                      <span className="text-white text-xs font-bold uppercase">{feature.label}</span>
                    </div>
                  ))}
                </div>
                
                {/* CTA */}
                {isEditing ? (
                  <span className={`inline-flex items-center gap-3 ${colors.bg} text-white px-8 py-4 font-black uppercase text-sm tracking-widest`}>
                    <Icon className="w-5 h-5" />
                    {module.buttonText}
                  </span>
                ) : (
                  <Link href={module.buttonLink || '#'} className={`inline-flex items-center gap-3 ${colors.bg} hover:bg-[#CCAA4C] text-white hover:text-[#353535] px-8 py-4 font-black uppercase text-sm tracking-widest transition-all`}>
                    <Icon className="w-5 h-5" />
                    {module.buttonText}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ATOMIC TV BANNER
function AtomicTVBannerBlock({ block, isEditing }: { block: PageBlock; isEditing: boolean }) {
  const { title, subtitle, description, features, buttonText, buttonLink } = block.props

  const content = (
    <div className="flex flex-col md:flex-row items-center">
      {/* Left - Icon & Branding */}
      <div className="bg-[#FF6B35] p-6 md:p-8 flex items-center gap-4 w-full md:w-auto shrink-0">
        <div className="w-16 h-16 bg-white flex items-center justify-center">
          <Tv className="w-8 h-8 text-[#FF6B35]" />
        </div>
        <div>
          <h2 
            className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {title}
          </h2>
          <p className="text-white/80 text-xs uppercase tracking-widest">
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* Middle - Description & Features */}
      <div className="flex-grow p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        <p className="text-white/70 text-sm md:text-base max-w-md text-center md:text-left">
          {description}
        </p>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {(features || []).map((item: any, i: number) => (
            <span 
              key={i}
              className="flex items-center gap-1 bg-white/10 px-3 py-1 text-white text-xs font-bold uppercase border border-white/20"
            >
              {item.icon} {item.label}
            </span>
          ))}
        </div>
      </div>
      
      {/* Right - CTA */}
      <div className="bg-[#1f1c13] p-6 md:p-8 w-full md:w-auto shrink-0 flex justify-center">
        <div className="flex items-center gap-3 bg-[#FF6B35] group-hover:bg-[#CCAA4C] text-white group-hover:text-[#353535] px-8 py-4 font-black uppercase text-sm tracking-widest transition-all">
          <Play className="w-5 h-5 fill-current" />
          {buttonText}
          <Radio className="w-4 h-4 animate-pulse" />
        </div>
      </div>
    </div>
  )

  return (
    <section className="bg-[#353535] border-y-4 border-[#FF6B35]">
      <div className="max-w-[1400px] mx-auto">
        {isEditing ? (
          <div className="block group">{content}</div>
        ) : (
          <Link href={buttonLink || '/tv'} className="block group">{content}</Link>
        )}
      </div>
    </section>
  )
}

// PROPAGANDA GRID - Uses FeaturedContent component for live data
function PropagandaGridBlock({ block, isEditing }: { block: PageBlock; isEditing: boolean }) {
  const { heading, posters, columns, useDatabaseContent, maxItems } = block.props

  // If using database content and not editing, render the dynamic component
  if (useDatabaseContent && !isEditing) {
    return (
      <FeaturedContent
        heading={heading || 'Featured Propaganda'}
        maxItems={maxItems || 3}
        showHeading={true}
      />
    )
  }

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16">
      {/* Section Heading */}
      <div className="flex items-center gap-6 mb-12">
        <h2 
          className="text-3xl md:text-4xl font-black uppercase tracking-tighter bg-[#353535] text-white px-6 py-2"
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {heading}
        </h2>
        <div className="flex-grow h-1 bg-[#353535]"></div>
      </div>

      {useDatabaseContent && isEditing ? (
        <div className="border-2 border-dashed border-[#CCAA4C]/50 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-[#CCAA4C]" />
          <p className="text-[#353535] font-bold">Dynamic Content Enabled</p>
          <p className="text-sm text-[#353535]/60">Will show {maxItems || 3} featured items from database</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns || 3} gap-10`}>
          {(posters || []).map((poster: any) => (
            <PosterCard 
              key={poster.id}
              poster={poster}
              isEditing={isEditing}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function PosterCard({ poster, isEditing }: { poster: any; isEditing: boolean }) {
  const content = (
    <div className="industrial-border-sm relative overflow-hidden bg-[#CCAA4C] p-1">
      <div className="bg-[#E3E2D5] p-6 h-full flex flex-col border-2 border-[#353535]">
        {/* Report Number */}
        <div className="absolute top-0 right-0 bg-[#353535] text-white px-3 py-1 text-xs font-bold uppercase z-10">
          {poster.reportNumber}
        </div>

        {/* Image */}
        <div className="w-full aspect-[4/5] bg-[#353535] mb-6 relative overflow-hidden">
          {poster.imageUrl && (
            <Image
              src={poster.imageUrl}
              alt={poster.title}
              fill
              className="object-cover opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
            />
          )}
          <div className="absolute inset-0 halftone-overlay"></div>
        </div>

        {/* Title */}
        <h3 
          className="text-2xl md:text-3xl font-black uppercase leading-none mb-2 text-[#353535]"
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {poster.title}
        </h3>

        {/* Description */}
        <p className="text-sm font-bold text-[#353535]/70 uppercase mb-6 italic tracking-tight">
          {poster.description}
        </p>

        {/* Button */}
        <div className="mt-auto">
          <span className="block w-full bg-[#353535] text-[#CCAA4C] py-3 font-bold uppercase tracking-widest text-center text-sm group-hover:bg-[#CCAA4C] group-hover:text-[#353535] transition-colors">
            {poster.buttonText}
          </span>
        </div>
      </div>
    </div>
  )

  return isEditing ? (
    <div className="block group">{content}</div>
  ) : (
    <Link href={poster.link || '#'} className="block group">{content}</Link>
  )
}

// BLOKE SCIENCE SLIDER - Default facts if not provided
const DEFAULT_BLOKE_SCIENCE_FACTS = [
  { id: '1', title: 'The First V8 Engine', fact: 'The first V8 engine was patented in 1902 by Léon Levavasseur.' },
  { id: '2', title: 'Burnout Physics', fact: 'A proper burnout can heat tyre rubber to over 200°C (392°F).' },
  { id: '3', title: 'The 10mm Socket Curse', fact: 'The average mechanic loses 3-5 10mm sockets per year.' },
  { id: '4', title: 'Shed Acoustics', fact: 'The optimal shed size for acoustic privacy is 4x3 metres.' },
  { id: '5', title: 'Beer Fridge Efficiency', fact: 'A dedicated beer fridge reaches optimal temperature 23% faster.' },
  { id: '6', title: 'Torque vs Horsepower', fact: 'Horsepower is how fast you hit the wall. Torque is how far you take the wall with you.' },
  { id: '7', title: 'The WD-40 Principle', fact: 'If it moves and shouldn\'t: duct tape. If it doesn\'t move and should: WD-40.' },
  { id: '8', title: 'Man Cave Temperature', fact: 'The ideal man cave temperature is 22°C - scientifically optimized since 1973.' },
  { id: '9', title: 'Tool Organization', fact: 'Installing a pegboard reduces tool-hunting from 2.3 hours to 47 minutes per week.' },
  { id: '10', title: 'Exhaust Note Science', fact: 'V8 exhaust notes between 80-120Hz trigger the same brain response as a perfect steak.' },
]

function BlokeScienceSliderBlock({ block }: { block: PageBlock }) {
  const { heading, autoPlay, interval } = block.props
  // Use default facts if none provided or less than 10
  const facts = block.props.facts?.length >= 10 ? block.props.facts : DEFAULT_BLOKE_SCIENCE_FACTS
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay ?? true)

  useEffect(() => {
    if (!isAutoPlaying || !facts?.length) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length)
    }, interval || 5000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, facts?.length, interval])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + (facts?.length || 1)) % (facts?.length || 1))
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % (facts?.length || 1))
  }

  const getVisibleIndices = () => {
    if (!facts?.length) return []
    const indices = []
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + facts.length) % facts.length
      indices.push(index)
    }
    return indices
  }

  return (
    <section className="bg-[#353535] py-16 border-y-8 border-[#CCAA4C]">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Heading */}
        <div className="flex items-center gap-6 mb-12">
          <div className="flex-grow h-1 bg-[#CCAA4C]"></div>
          <h2 
            className="text-3xl md:text-4xl font-black uppercase tracking-tighter bg-[#CCAA4C] text-[#353535] px-6 py-2"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            {heading}
          </h2>
          <div className="flex-grow h-1 bg-[#CCAA4C]"></div>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Cards Container - with padding for buttons */}
          <div className="flex justify-center items-center gap-6 py-4 px-20 md:px-24 overflow-hidden">
            {getVisibleIndices().map((factIndex, position) => {
              const fact = facts?.[factIndex]
              if (!fact) return null
              const isCenter = position === 1
              
              return (
                <div
                  key={factIndex}
                  className={`
                    industrial-border bg-[#E3E2D5] p-6 md:p-8 relative transition-all duration-500 ease-out
                    ${isCenter ? 'scale-100 opacity-100 z-10' : 'scale-90 opacity-60 z-0'}
                    w-full max-w-sm shrink-0
                  `}
                >
                  <div className="absolute top-4 right-4 stamp text-xs">Did You Know?</div>
                  <div className="absolute top-4 left-4 bg-[#FF6B35] text-white px-2 py-1 text-[10px] font-black">
                    #{factIndex + 1}
                  </div>
                  <h3 
                    className="text-xl md:text-2xl font-black uppercase mb-4 text-[#353535] pr-24 pt-6"
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    {fact.title}
                  </h3>
                  <p className="font-mono text-sm text-[#353535]/80 leading-relaxed">
                    {fact.fact}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Navigation Buttons - positioned at edges, outside cards */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-[#CCAA4C] hover:bg-[#FF6B35] text-[#353535] hover:text-white flex items-center justify-center transition-colors shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-[#CCAA4C] hover:bg-[#FF6B35] text-[#353535] hover:text-white flex items-center justify-center transition-colors shadow-lg"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {(facts || []).map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false)
                  setCurrentIndex(index)
                }}
                className={`w-3 h-3 transition-all ${
                  index === currentIndex 
                    ? 'bg-[#CCAA4C] scale-125' 
                    : 'bg-[#E3E2D5]/50 hover:bg-[#E3E2D5]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// BROADCAST LIST - Uses LatestBroadcasts component for live data
function BroadcastListBlock({ block, isEditing }: { block: PageBlock; isEditing: boolean }) {
  const { heading, headingVariant, broadcasts, showViewAllButton, viewAllLink, viewAllText, useDatabaseContent, maxItems, variant } = block.props

  // If using database content and not editing, render the dynamic component
  if (useDatabaseContent && !isEditing) {
    return (
      <LatestBroadcasts
        heading={heading}
        headingVariant={headingVariant}
        maxItems={maxItems || 5}
        showViewAllButton={showViewAllButton}
        viewAllLink={viewAllLink}
        viewAllText={viewAllText}
        variant={variant || 'list'}
      />
    )
  }

  // Static/editing mode - show manual broadcasts
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16">
      {/* Section Heading */}
      <div className={`flex items-center gap-6 mb-12 ${headingVariant === 'right' ? 'flex-row-reverse' : ''}`}>
        <h2 
          className="text-3xl md:text-4xl font-black uppercase tracking-tighter bg-[#353535] text-white px-6 py-2"
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {heading}
        </h2>
        <div className="flex-grow h-1 bg-[#353535]"></div>
      </div>

      {useDatabaseContent && isEditing ? (
        <div className="border-2 border-dashed border-[#CCAA4C]/50 rounded-lg p-8 text-center">
          <Radio className="w-12 h-12 mx-auto mb-4 text-[#CCAA4C]" />
          <p className="text-[#353535] font-bold">Dynamic Content Enabled</p>
          <p className="text-sm text-[#353535]/60">Will show {maxItems || 5} latest broadcasts from database</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(broadcasts || []).map((item: any) => {
            const content = (
              <div className="flex flex-col md:flex-row items-center border-4 border-[#353535] bg-white group hover:border-[#CCAA4C] transition-colors">
                <div className="w-full md:w-48 aspect-video md:aspect-square bg-[#353535] shrink-0 relative overflow-hidden">
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#CCAA4C]">
                      <Radio className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex-grow flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                  <div>
                    <div className="text-xs font-bold text-[#CCAA4C] uppercase mb-1">
                      Entry: {item.date}
                    </div>
                    <h4 
                      className="text-xl md:text-2xl font-black uppercase group-hover:text-[#CCAA4C] transition-colors"
                      style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                    >
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-[#353535]/70 mt-1 line-clamp-1">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-4 text-[#353535]/50">
                    <Headphones className="w-5 h-5 hover:text-[#CCAA4C] cursor-pointer" />
                    <Share2 className="w-5 h-5 hover:text-[#CCAA4C] cursor-pointer" />
                    <Heart className="w-5 h-5 hover:text-[#CCAA4C] cursor-pointer" />
                  </div>
                </div>
              </div>
            )

            return isEditing ? (
              <div key={item.id}>{content}</div>
            ) : (
              <Link href={item.link || '/shows'} key={item.id}>{content}</Link>
            )
          })}
        </div>
      )}

      {/* View All Button */}
      {showViewAllButton && (
        <div className="text-center mt-12">
          {isEditing ? (
            <span className="inline-block px-8 py-4 bg-[#E3E2D5] text-[#353535] font-bold uppercase tracking-widest border-4 border-[#353535]">
              {viewAllText}
            </span>
          ) : (
            <Link href={viewAllLink || '/shows'} className="inline-block px-8 py-4 bg-[#E3E2D5] text-[#353535] font-bold uppercase tracking-widest border-4 border-[#353535] hover:bg-[#353535] hover:text-white transition-colors">
              {viewAllText}
            </Link>
          )}
        </div>
      )}
    </section>
  )
}

// CATEGORY ICON GRID
function CategoryIconGridBlock({ block, isEditing }: { block: PageBlock; isEditing: boolean }) {
  const { categories } = block.props

  return (
    <section className="bg-[#1f1c13] py-16 border-t-8 border-[#CCAA4C]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {(categories || []).map((cat: any) => {
            const content = (
              <div className="bg-[#1f1c13] p-6 text-center hover:scale-105 transition-all group">
                <div className="w-32 h-32 mx-auto mb-4">
                  {cat.imageUrl ? (
                    <img 
                      src={cat.imageUrl} 
                      alt={cat.label} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#353535] flex items-center justify-center text-[#CCAA4C]">
                      <Star className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <span 
                  className="text-[#CCAA4C] text-lg font-black uppercase tracking-tight"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {cat.label}
                </span>
              </div>
            )

            return isEditing ? (
              <div key={cat.id}>{content}</div>
            ) : (
              <Link key={cat.id} href={cat.link || '#'}>{content}</Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// BRAND STATEMENT
function BrandStatementBlock({ block }: { block: PageBlock }) {
  const { quote, subtitle } = block.props

  return (
    <section className="bg-[#CCAA4C] py-12 border-y-4 border-[#353535]">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <p 
          className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#353535]"
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {quote}
        </p>
        <p className="text-sm font-mono uppercase mt-4 text-[#353535]/70">
          {subtitle}
        </p>
      </div>
    </section>
  )
}

// ============================================
// GENERIC BLOCKS (existing)
// ============================================

function HeroBlock({ block, isEditing }: { block: PageBlock; isEditing: boolean }) {
  const { title, subtitle, backgroundImage, overlayOpacity, buttonText, buttonLink, alignment } = block.props
  
  // Get colors from styling or use defaults
  const textColor = block.styling?.textColor || '#FFFFFF'
  const accentColor = block.styling?.accentColor || '#CCAA4C'
  const bgColor = block.styling?.backgroundColor || ''
  const bgGradient = block.styling?.backgroundGradient || ''
  
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }

  // Build background style
  const backgroundStyle: React.CSSProperties = {}
  if (backgroundImage && !block.styling?.backgroundVideo) {
    backgroundStyle.backgroundImage = `url(${backgroundImage})`
    backgroundStyle.backgroundSize = 'cover'
    backgroundStyle.backgroundPosition = 'center'
  } else if (bgGradient) {
    backgroundStyle.background = bgGradient
  } else if (bgColor) {
    backgroundStyle.backgroundColor = bgColor
  }

  const hasBackground = backgroundImage || bgColor || bgGradient || block.styling?.backgroundVideo

  return (
    <div 
      className={`relative flex flex-col justify-center px-8 py-16 min-h-[400px] ${alignmentClasses[alignment as keyof typeof alignmentClasses] || alignmentClasses.center}`}
      style={backgroundStyle}
    >
      {/* Overlay - only show if there's a background image/video */}
      {(backgroundImage || block.styling?.backgroundVideo) && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: (overlayOpacity || 60) / 100 }}
        />
      )}
      
      <div className="relative z-10 max-w-4xl">
        {title && (
          <h1 
            className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-oswald), sans-serif', color: textColor }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p 
            className="text-xl uppercase tracking-widest mb-8"
            style={{ color: accentColor }}
          >
            {subtitle}
          </p>
        )}
        {buttonText && (
          isEditing ? (
            <span 
              className="inline-block px-8 py-3 font-bold uppercase tracking-wide"
              style={{ backgroundColor: accentColor, color: bgColor || '#1a1a1a' }}
            >
              {buttonText}
            </span>
          ) : (
            <Link 
              href={buttonLink || '/'}
              className="inline-block px-8 py-3 font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
              style={{ backgroundColor: accentColor, color: bgColor || '#1a1a1a' }}
            >
              {buttonText}
            </Link>
          )
        )}
      </div>

      {/* Fallback gradient if no background set */}
      {!hasBackground && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#353535] to-[#1a1a1a] -z-10" />
      )}
    </div>
  )
}

function RichTextBlock({ block }: { block: PageBlock }) {
  const { heading, headingSize, body, alignment } = block.props

  // Get colors from styling
  const textColor = block.styling?.textColor || '#AEACA1'
  const accentColor = block.styling?.accentColor || '#CCAA4C'
  const bgColor = block.styling?.backgroundColor || ''

  const headingSizes = {
    small: 'text-xl',
    medium: 'text-2xl md:text-3xl',
    large: 'text-3xl md:text-4xl',
  }

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  // Check if body contains HTML
  const isHTML = body && (body.includes('<') && body.includes('>'))

  return (
    <div 
      className="px-8 py-12"
      style={{ backgroundColor: bgColor || undefined }}
    >
      <div className={`max-w-4xl mx-auto ${alignmentClasses[alignment as keyof typeof alignmentClasses] || alignmentClasses.left}`}>
        {heading && (
          <h2 
            className={`${headingSizes[headingSize as keyof typeof headingSizes] || headingSizes.medium} font-bold uppercase tracking-tight mb-6`}
            style={{ fontFamily: 'var(--font-oswald), sans-serif', color: accentColor }}
          >
            {heading}
          </h2>
        )}
        {body && (
          isHTML ? (
            <div 
              className="rich-text-content leading-relaxed prose prose-invert max-w-none"
              style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <div 
              className="leading-relaxed whitespace-pre-wrap"
              style={{ color: textColor }}
            >
              {body}
            </div>
          )
        )}
      </div>
      
      {/* Rich text content styles */}
      <style jsx global>{`
        .rich-text-content h1,
        .rich-text-content h2,
        .rich-text-content h3,
        .rich-text-content h4 {
          color: ${accentColor};
          font-family: var(--font-oswald), sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .rich-text-content h1 { font-size: 2.25em; }
        .rich-text-content h2 { font-size: 1.75em; }
        .rich-text-content h3 { font-size: 1.5em; }
        .rich-text-content h4 { font-size: 1.25em; }
        .rich-text-content p {
          margin-bottom: 1em;
        }
        .rich-text-content a {
          color: ${accentColor};
          text-decoration: underline;
        }
        .rich-text-content a:hover {
          opacity: 0.8;
        }
        .rich-text-content strong, 
        .rich-text-content b {
          font-weight: 700;
        }
        .rich-text-content em,
        .rich-text-content i {
          font-style: italic;
        }
        .rich-text-content ul,
        .rich-text-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        .rich-text-content ul {
          list-style-type: disc;
        }
        .rich-text-content ol {
          list-style-type: decimal;
        }
        .rich-text-content li {
          margin-bottom: 0.5em;
        }
        .rich-text-content blockquote {
          border-left: 4px solid ${accentColor};
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          opacity: 0.9;
        }
        .rich-text-content pre,
        .rich-text-content code {
          background: rgba(0,0,0,0.3);
          border-radius: 4px;
          padding: 0.2em 0.4em;
          font-family: monospace;
        }
        .rich-text-content pre {
          padding: 1em;
          overflow-x: auto;
        }
        .rich-text-content img {
          max-width: 100%;
          border-radius: 4px;
          margin: 1em 0;
        }
      `}</style>
    </div>
  )
}

function CTAStripBlock({ block }: { block: PageBlock }) {
  const { text, buttonText } = block.props

  const variantStyles = {
    black: 'bg-[#1a1a1a] border-y-4 border-[#CCAA4C]',
    gold: 'bg-[#CCAA4C]',
    warning: 'bg-[#FF6B35]',
  }

  const textColors = {
    black: 'text-white',
    gold: 'text-[#1a1a1a]',
    warning: 'text-white',
  }

  const buttonStyles = {
    black: 'bg-[#CCAA4C] text-[#1a1a1a]',
    gold: 'bg-[#1a1a1a] text-white',
    warning: 'bg-[#1a1a1a] text-white',
  }

  return (
    <div className={`px-8 py-8 ${variantStyles[block.variant as keyof typeof variantStyles] || variantStyles.gold}`}>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className={`text-xl font-bold uppercase tracking-wide ${textColors[block.variant as keyof typeof textColors] || textColors.gold}`}>
          {text}
        </p>
        {buttonText && (
          <span className={`px-6 py-2 font-bold uppercase tracking-wide ${buttonStyles[block.variant as keyof typeof buttonStyles] || buttonStyles.gold}`}>
            {buttonText}
          </span>
        )}
      </div>
    </div>
  )
}

function PosterBlock({ block }: { block: PageBlock }) {
  const { image, caption } = block.props

  return (
    <div className="px-8 py-12">
      <div className="max-w-2xl mx-auto border-8 border-[#353535] shadow-2xl">
        {image ? (
          <img src={image} alt={caption || ''} className="w-full" />
        ) : (
          <div className="aspect-[3/4] bg-[#252525] flex items-center justify-center">
            <p className="text-[#666]">No image set</p>
          </div>
        )}
        {caption && (
          <p className="text-center text-[#CCAA4C] uppercase tracking-wider text-sm py-4 bg-[#1a1a1a]">
            {caption}
          </p>
        )}
      </div>
    </div>
  )
}

function VideoBlock({ block }: { block: PageBlock }) {
  const { videos, layout } = block.props
  const video = videos?.[0]

  const getEmbedUrl = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    return url
  }

  return (
    <div className="px-8 py-12 max-w-3xl mx-auto">
      {video?.url ? (
        <div className="relative aspect-video bg-[#1a1a1a] border-4 border-[#353535]">
          <iframe
            src={getEmbedUrl(video.url)}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="aspect-video bg-[#252525] flex items-center justify-center border-4 border-[#353535]">
          <p className="text-[#666]">No video URL set</p>
        </div>
      )}
    </div>
  )
}

function DividerBlock({ block }: { block: PageBlock }) {
  const { height } = block.props

  const heightClasses = {
    small: 'h-8',
    medium: 'h-16',
    large: 'h-24',
  }

  const variantStyles: Record<string, React.ReactNode> = {
    atomic: <div className="h-1 bg-gradient-to-r from-transparent via-[#CCAA4C] to-transparent" />,
    gear: (
      <div className="h-2 flex items-center justify-center gap-2">
        <div className="flex-1 h-px bg-[#353535]" />
        <span className="text-[#CCAA4C]">⚙️</span>
        <div className="flex-1 h-px bg-[#353535]" />
      </div>
    ),
    radiation: <div className="h-4 hazard-stripe opacity-30" />,
    simple: <div className="h-px bg-[#353535]" />,
  }

  return (
    <div className={`px-8 flex items-center ${heightClasses[height as keyof typeof heightClasses] || heightClasses.medium}`}>
      <div className="w-full">
        {variantStyles[block.variant] || variantStyles.simple}
      </div>
    </div>
  )
}

// BUTTON GROUP BLOCK
function ButtonGroupBlock({ block, isEditing }: { block: PageBlock; isEditing: boolean }) {
  const { buttons, alignment, spacing, direction } = block.props

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  const spacingClasses = {
    tight: 'gap-2',
    normal: 'gap-4',
    wide: 'gap-6',
  }

  const directionClasses = {
    horizontal: 'flex-row flex-wrap',
    vertical: 'flex-col',
  }

  const getButtonClasses = (style: string, size: string) => {
    const baseClasses = 'font-bold uppercase tracking-widest transition-all border-4'
    
    const sizeClasses = {
      small: 'px-4 py-2 text-xs',
      medium: 'px-6 py-3 text-sm',
      large: 'px-8 py-4 text-base',
    }

    const styleClasses = {
      primary: 'bg-[#CCAA4C] border-[#CCAA4C] text-[#1a1a1a] hover:bg-[#FF6B35] hover:border-[#FF6B35] hover:text-white',
      secondary: 'bg-[#353535] border-[#353535] text-white hover:bg-[#CCAA4C] hover:border-[#CCAA4C] hover:text-[#1a1a1a]',
      outline: 'bg-transparent border-[#CCAA4C] text-[#CCAA4C] hover:bg-[#CCAA4C] hover:text-[#1a1a1a]',
      ghost: 'bg-transparent border-transparent text-[#CCAA4C] hover:bg-[#CCAA4C]/10',
    }

    return `${baseClasses} ${sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium} ${styleClasses[style as keyof typeof styleClasses] || styleClasses.primary}`
  }

  // Pill variant adjustments
  const pillClasses = block.variant === 'pill' ? 'rounded-full' : ''

  return (
    <div className="px-8 py-8">
      <div className={`flex ${alignmentClasses[alignment as keyof typeof alignmentClasses] || alignmentClasses.center} ${spacingClasses[spacing as keyof typeof spacingClasses] || spacingClasses.normal} ${directionClasses[direction as keyof typeof directionClasses] || directionClasses.horizontal}`}>
        {(buttons || []).map((btn: any) => {
          const classes = `${getButtonClasses(btn.style, btn.size)} ${pillClasses}`
          
          return isEditing ? (
            <span key={btn.id} className={classes}>
              {btn.icon && <span className="mr-2">{btn.icon}</span>}
              {btn.text}
            </span>
          ) : (
            <Link key={btn.id} href={btn.link || '/'} className={classes}>
              {btn.icon && <span className="mr-2">{btn.icon}</span>}
              {btn.text}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function CommunityFeedBlock({ block, isEditing }: { block: PageBlock; isEditing: boolean }) {
  const { feedType, maxItems } = block.props
  const placeholderItems = Array.from({ length: maxItems || 6 }, (_, i) => ({ id: `placeholder_${i}`, title: `Upload ${i + 1}` }))

  return (
    <div className="px-8 py-12">
      <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-6 text-center">
        Community {feedType === 'latest' ? 'Latest' : feedType === 'trending' ? 'Trending' : 'Featured'}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {placeholderItems.map(item => (
          <div key={item.id} className="aspect-square bg-[#252525] border-2 border-[#353535] flex items-center justify-center">
            <span className="text-[#666] text-sm">{isEditing ? item.title : 'Loading...'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductEmbedBlock({ block, isEditing }: { block: PageBlock; isEditing: boolean }) {
  const { maxItems } = block.props
  const placeholderItems = Array.from({ length: maxItems || 4 }, (_, i) => ({ id: `product_${i}`, name: `Product ${i + 1}` }))

  return (
    <div className="px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {placeholderItems.map(item => (
          <div key={item.id} className="bg-[#252525] border-2 border-[#353535] p-4">
            <div className="aspect-square bg-[#1a1a1a] mb-3 flex items-center justify-center">
              <span className="text-[#666] text-sm">🛒</span>
            </div>
            <p className="text-white text-sm font-bold">{item.name}</p>
            <p className="text-[#CCAA4C] text-sm">$XX.XX</p>
          </div>
        ))}
      </div>
    </div>
  )
}
