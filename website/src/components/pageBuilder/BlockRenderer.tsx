'use client'

import React from 'react'
import Link from 'next/link'
import { PageBlock } from '@/lib/pageBuilder'
import { Gamepad2, ShoppingBag, MessageSquare, Trophy, Tag, Users, Camera, Tv, Zap, Star } from 'lucide-react'

interface BlockRendererProps {
  block: PageBlock
  isEditing?: boolean
}

// Helper to get background - gradient takes priority only if it has actual content
function getBackground(styling: any, defaultBg?: string): string | undefined {
  // Check if gradient has actual content (not empty/null/undefined)
  if (styling.backgroundGradient && styling.backgroundGradient.trim() !== '') {
    return styling.backgroundGradient
  }
  // Check if backgroundColor has actual content
  if (styling.backgroundColor && styling.backgroundColor.trim() !== '') {
    return styling.backgroundColor
  }
  // Return default
  return defaultBg
}

// Helper to convert spacing size to CSS value
function getSpacingValue(size: string | undefined): string {
  switch (size) {
    case 'none': return '0'
    case 'small': return '8px'
    case 'medium': return '16px'
    case 'large': return '32px'
    case 'xlarge': return '64px'
    default: return '0'
  }
}


// Visual WYSIWYG BlockRenderer - renders actual block previews
export function BlockRenderer({ block, isEditing }: BlockRendererProps) {
  const props = block.props || {}
  const styling = block.styling || {}
  
  // Common wrapper style
  const wrapperClass = isEditing ? 'pointer-events-none' : ''
  
  // Get margin styles - these will be applied via padding on block's outer div
  // Using padding instead of margin prevents white gaps
  const marginStyles: React.CSSProperties = {
    paddingTop: styling.marginTop ? getSpacingValue(styling.marginTop) : undefined,
    paddingBottom: styling.marginBottom ? getSpacingValue(styling.marginBottom) : undefined,
  }
  const hasMargin = styling.marginTop || styling.marginBottom
  
  // Get padding styles - applied to content area inside the block
  const paddingStyles: React.CSSProperties = {
    paddingTop: styling.paddingTop && styling.paddingTop !== 'none' ? getSpacingValue(styling.paddingTop) : undefined,
    paddingBottom: styling.paddingBottom && styling.paddingBottom !== 'none' ? getSpacingValue(styling.paddingBottom) : undefined,
  }
  const hasPadding = (styling.paddingTop && styling.paddingTop !== 'none') || 
                     (styling.paddingBottom && styling.paddingBottom !== 'none')
  
  // Helper to wrap content with spacing
  // - Margin: adds space OUTSIDE the block (between blocks)
  // - Padding: adds space INSIDE the block (pushes content inward)
  // Hero/atomicHero blocks handle their own spacing internally
  const wrapWithSpacing = (content: React.ReactNode) => {
    // Skip wrapping for blocks that handle their own spacing
    if (block.type === 'hero' || block.type === 'atomicHero') {
      return content
    }
    
    const needsWrapper = hasMargin || hasPadding
    if (!needsWrapper) return content
    
    // Get the background from the block's styling or use dark default
    const bgColor = styling.backgroundColor || styling.backgroundGradient || '#1a1a1a'
    
    return (
      <div style={{
        ...marginStyles,
        ...paddingStyles,
        background: hasMargin ? bgColor : undefined,
      }}>
        {content}
      </div>
    )
  }
  
  // Render block content
  const renderContent = () => {
  switch (block.type) {
    // ============================================
    // HERO BLOCKS - Atomic Tawk Industrial Style
    // ============================================
    case 'hero':
    case 'atomicHero':
      // Check for video in styling (where it's actually saved) or props
      const hasVideo = styling.backgroundVideo || props.backgroundVideo || props.videoUrl
      const videoUrl = styling.backgroundVideo || props.backgroundVideo || props.videoUrl
      const overlayOpacity = styling.backgroundOverlay ?? props.overlayOpacity ?? 50
      
      // Get background image from styling or props
      const bgImage = styling.backgroundImage || props.backgroundImage
      
      // Hero handles its own spacing - video/image fills the entire space including margins
      // Margin adds space that the video/bg fills, padding adds space inside the content
      const heroMarginSpacing = {
        paddingTop: styling.marginTop ? getSpacingValue(styling.marginTop) : undefined,
        paddingBottom: styling.marginBottom ? getSpacingValue(styling.marginBottom) : undefined,
      }
      const heroContentPadding = {
        paddingTop: styling.paddingTop && styling.paddingTop !== 'none' ? getSpacingValue(styling.paddingTop) : undefined,
        paddingBottom: styling.paddingBottom && styling.paddingBottom !== 'none' ? getSpacingValue(styling.paddingBottom) : undefined,
      }
      
      // Mark that hero handles its own spacing (don't wrap it externally)
      const heroContent = (
        <div 
          className={`relative min-h-[500px] flex items-center justify-center overflow-hidden ${wrapperClass}`}
          style={{
            ...heroMarginSpacing,
            backgroundImage: !hasVideo && bgImage 
              ? `url(${bgImage})` 
              : !hasVideo ? 'radial-gradient(circle at center, #E8E7DA 0%, #D4D3C6 100%)' : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: hasVideo ? '#1a1a1a' : undefined,
          }}
        >
          {/* Background Video */}
          {hasVideo && videoUrl && (
            <>
              <video
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
                style={{ objectFit: 'cover' }}
              />
              {/* Video indicator badge */}
              <div className="absolute top-2 left-2 z-50 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <span>📹</span> Video Background
              </div>
            </>
          )}
          
          {/* Overlay for video */}
          {hasVideo && (
            <div 
              className="absolute inset-0 bg-black"
              style={{ opacity: overlayOpacity / 100 }}
            />
          )}
          
          {/* Halftone texture overlay (only if no video) */}
          {!hasVideo && (
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundImage: 'radial-gradient(circle, #00000008 1px, transparent 1px)',
                backgroundSize: '4px 4px',
              }}
            />
          )}
          
          {/* Content */}
          <div 
            className={`relative z-10 text-center px-8 max-w-4xl ${
              props.alignment === 'left' ? 'text-left mr-auto' : 
              props.alignment === 'right' ? 'text-right ml-auto' : 'text-center mx-auto'
            }`}
            style={heroContentPadding}
          >
            {/* Logo - use props.logoUrl or default, with scale control */}
            <div className="mb-8">
              <img 
                src={props.logoUrl || '/logo.png'} 
                alt="Atomic Tawk" 
                className="mx-auto"
                style={{ 
                  height: `${(props.logoScale ?? 100) * 1.28}px`, // Base height 128px (h-32) scaled
                  maxWidth: `${(props.logoScale ?? 100) * 3}px`, // Base max-width 300px scaled
                  objectFit: 'contain',
                }}
              />
            </div>
            
            {/* Main headline - uses styling.textColor */}
            <h1 
              className="text-5xl md:text-7xl font-black uppercase leading-[0.85] tracking-tighter mb-4"
              style={{ 
                fontFamily: 'var(--font-oswald), sans-serif',
                color: styling.textColor || '#353535',
              }}
            >
              {(props.title || props.headline || 'Tawk Loud.\nDrive Louder.\nFeel Prouder.').split('\n').map((line: string, i: number) => (
                <React.Fragment key={i}>
                  {line}
                  {i < (props.title || props.headline || 'Tawk Loud.\nDrive Louder.\nFeel Prouder.').split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </h1>
            
            {/* Subtitle in skewed banner style - uses styling.accentColor */}
            <div 
              className="inline-block px-8 py-2 mb-8"
              style={{ 
                transform: 'skewX(-12deg)',
                backgroundColor: styling.accentColor || '#353535',
              }}
            >
              <p 
                className="text-lg md:text-2xl font-bold italic uppercase tracking-[0.2em]"
                style={{ 
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: 'white',
                  transform: 'skewX(12deg)',
                }}
              >
                {props.subtitle || props.subheadline || 'Where real blokes talk torque.'}
              </p>
            </div>
            
            {/* Industrial style buttons - uses styling colors */}
            {((props.showPrimaryButton ?? true) || (props.showSecondaryButton ?? true)) && (
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                {(props.showPrimaryButton ?? true) && (
                  <button 
                    className="relative px-16 py-5 font-bold uppercase tracking-wider text-lg border-4"
                    style={{ 
                      fontFamily: 'var(--font-oswald), sans-serif',
                      backgroundColor: styling.accentColor || '#C9A227',
                      borderColor: props.primaryButtonTextColor || styling.textColor || '#353535',
                      color: props.primaryButtonTextColor || styling.textColor || '#353535',
                    }}
                  >
                    {/* Clean corner dots */}
                    <span className="absolute top-3 left-4 w-2 h-2 rounded-full" style={{ backgroundColor: props.primaryButtonTextColor || styling.textColor || '#353535' }} />
                    <span className="absolute top-3 right-4 w-2 h-2 rounded-full" style={{ backgroundColor: props.primaryButtonTextColor || styling.textColor || '#353535' }} />
                    <span className="absolute bottom-3 left-4 w-2 h-2 rounded-full" style={{ backgroundColor: props.primaryButtonTextColor || styling.textColor || '#353535' }} />
                    <span className="absolute bottom-3 right-4 w-2 h-2 rounded-full" style={{ backgroundColor: props.primaryButtonTextColor || styling.textColor || '#353535' }} />
                    {props.primaryButtonText || props.buttonText || 'Start Broadcast'}
                  </button>
                )}
                {(props.showSecondaryButton ?? true) && (
                  <button 
                    className="relative px-16 py-5 font-bold uppercase tracking-wider text-lg border-4"
                    style={{ 
                      fontFamily: 'var(--font-oswald), sans-serif',
                      backgroundColor: '#FFFFFF',
                      borderColor: props.secondaryButtonTextColor || styling.textColor || '#353535',
                      color: props.secondaryButtonTextColor || styling.textColor || '#353535',
                    }}
                  >
                    {/* Clean corner dots */}
                    <span className="absolute top-3 left-4 w-2 h-2 rounded-full" style={{ backgroundColor: props.secondaryButtonTextColor || styling.textColor || '#353535' }} />
                    <span className="absolute top-3 right-4 w-2 h-2 rounded-full" style={{ backgroundColor: props.secondaryButtonTextColor || styling.textColor || '#353535' }} />
                    <span className="absolute bottom-3 left-4 w-2 h-2 rounded-full" style={{ backgroundColor: props.secondaryButtonTextColor || styling.textColor || '#353535' }} />
                    <span className="absolute bottom-3 right-4 w-2 h-2 rounded-full" style={{ backgroundColor: props.secondaryButtonTextColor || styling.textColor || '#353535' }} />
                    {props.secondaryButtonText || 'Garage Store'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )
      // Hero handles its own spacing internally, so return directly without external wrapper
      return heroContent

    // ============================================
    // TEXT / CONTENT BLOCKS
    // ============================================
    case 'richText':
      const textColor = styling.textColor || '#E8E7DA'
      const accentColor = styling.accentColor || '#CCAA4C'
      const hasTextBg = styling.backgroundGradient || styling.backgroundColor || styling.backgroundImage
      
      return (
        <div 
          className={`py-12 ${wrapperClass}`}
          style={{ 
            background: getBackground(styling),
            backgroundImage: styling.backgroundImage ? `url(${styling.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="max-w-4xl mx-auto px-6">
            {props.heading && (
              <h2 
                className="text-3xl font-bold uppercase tracking-tight mb-6"
                style={{ 
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: accentColor,
                }}
              >
                {props.heading}
              </h2>
            )}
            {/* Scoped styles for rich text content - headings use accent color */}
            <style>{`
              .rich-text-content h1 { font-size: 2.5em; font-weight: bold; margin: 0.5em 0; font-family: var(--font-oswald), sans-serif; color: ${accentColor}; text-transform: uppercase; }
              .rich-text-content h2 { font-size: 2em; font-weight: bold; margin: 0.5em 0; font-family: var(--font-oswald), sans-serif; color: ${accentColor}; text-transform: uppercase; }
              .rich-text-content h3 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; font-family: var(--font-oswald), sans-serif; color: ${accentColor}; text-transform: uppercase; }
              .rich-text-content p { margin: 1em 0; line-height: 1.7; white-space: pre-line; }
              .rich-text-content li { margin-left: 1.5em; list-style: disc; margin-bottom: 0.5em; }
              .rich-text-content a { color: ${accentColor}; text-decoration: underline; }
              .rich-text-content strong, .rich-text-content b { font-weight: bold; }
              .rich-text-content em, .rich-text-content i { font-style: italic; }
              .rich-text-content u { text-decoration: underline; }
            `}</style>
            <div 
              className="rich-text-content max-w-none"
              style={{ 
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                color: textColor,
                fontSize: '1.125rem',
                whiteSpace: 'pre-line', // Preserve line breaks
              }}
              dangerouslySetInnerHTML={{ __html: (props.body || '<p>Enter your content here...</p>').replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      )

    case 'ctaStrip':
      return (
        <div 
          className={`py-8 ${wrapperClass}`}
          style={{ background: getBackground(styling, '#C9A227') }}
        >
          <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 
                className="text-2xl md:text-3xl font-bold uppercase tracking-tight"
                style={{ 
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: '#353535', 
                }}
              >
                {props.headline || 'TAKE ACTION NOW'}
              </h3>
              {props.subtext && (
                <p 
                  className="text-[#353535]/80 font-medium uppercase tracking-wider text-sm"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {props.subtext}
                </p>
              )}
            </div>
            <button 
              className="relative px-8 py-4 font-bold uppercase tracking-widest text-sm border-4"
              style={{ 
                fontFamily: 'var(--font-oswald), sans-serif',
                backgroundColor: '#353535',
                borderColor: '#1a1a1a',
                color: '#E3E2D5',
                boxShadow: '4px 4px 0 rgba(0,0,0,0.2)',
              }}
            >
              {props.buttonText || 'Learn More'}
            </button>
          </div>
        </div>
      )

    // ============================================
    // MEDIA BLOCKS
    // ============================================
    case 'poster':
      return (
        <div 
          className={`py-12 ${wrapperClass}`}
          style={{ background: getBackground(styling) }}
        >
        <div className="max-w-2xl mx-auto px-6">
          <div 
            className="relative aspect-[3/4] overflow-hidden"
            style={{
              backgroundColor: '#E3E2D5',
              border: '8px solid #353535',
              boxShadow: '12px 12px 0 rgba(0,0,0,0.3)',
            }}
          >
            {/* Corner rivets */}
            <span className="absolute top-4 left-4 w-4 h-4 rounded-full bg-[#8B7355] border-2 border-[#353535] z-10" />
            <span className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#8B7355] border-2 border-[#353535] z-10" />
            <span className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-[#8B7355] border-2 border-[#353535] z-10" />
            <span className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-[#8B7355] border-2 border-[#353535] z-10" />
            
            {props.imageUrl ? (
              <img 
                src={props.imageUrl} 
                alt={props.caption || 'Poster'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                <span className="text-6xl mb-4">🖼️</span>
                <span 
                  className="text-2xl font-black uppercase tracking-tight"
                  style={{ color: '#353535', fontStyle: 'italic' }}
                >
                  PROPAGANDA POSTER
                </span>
                <span className="text-sm text-[#353535]/60 mt-2 uppercase tracking-widest">
                  Add your image
                </span>
              </div>
            )}
            {props.caption && (
              <div 
                className="absolute bottom-0 left-0 right-0 p-4"
                style={{ backgroundColor: '#353535' }}
              >
                <p 
                  className="text-center font-bold uppercase tracking-widest text-sm"
                  style={{ color: '#E3E2D5' }}
                >
                  {props.caption}
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      )

    // ============================================
    // SIMPLE IMAGE - with scale and caption
    // ============================================
    case 'simpleImage':
      const imgScale = props.scale ?? 100
      const imgAlignment = props.alignment || 'center'
      const alignmentClass = imgAlignment === 'left' ? 'mr-auto' : imgAlignment === 'right' ? 'ml-auto' : 'mx-auto'
      const maxWidthClass = props.maxWidth === 'small' ? 'max-w-md' : props.maxWidth === 'medium' ? 'max-w-2xl' : props.maxWidth === 'large' ? 'max-w-4xl' : 'max-w-full'
      
      return (
        <div 
          className={`py-8 ${wrapperClass}`}
          style={{ background: getBackground(styling, 'transparent') }}
        >
          <div className={`px-6 ${maxWidthClass} ${alignmentClass}`}>
            <div 
              className={`${alignmentClass}`}
              style={{ width: `${imgScale}%` }}
            >
              {props.imageUrl ? (
                <img 
                  src={props.imageUrl} 
                  alt={props.alt || 'Image'} 
                  className="w-full h-auto"
                  style={{ 
                    borderRadius: block.variant === 'rounded' ? '12px' : block.variant === 'framed' ? '0' : '0',
                    border: block.variant === 'framed' ? '4px solid #353535' : 'none',
                    boxShadow: block.variant === 'framed' ? '8px 8px 0 rgba(0,0,0,0.2)' : 'none',
                  }}
                />
              ) : (
                <div 
                  className="w-full aspect-video flex flex-col items-center justify-center bg-[#353535]/10 border-2 border-dashed border-[#353535]/30 rounded"
                >
                  <span className="text-4xl mb-2">🖼️</span>
                  <span className="text-sm text-[#353535]/60 uppercase tracking-widest">
                    Add Image
                  </span>
                </div>
              )}
              {/* Caption */}
              {props.showCaption && props.caption && (
                <p 
                  className={`mt-3 text-sm italic ${imgAlignment === 'center' ? 'text-center' : imgAlignment === 'right' ? 'text-right' : 'text-left'}`}
                  style={{ 
                    color: styling.textColor || '#666',
                    fontFamily: 'var(--font-space-grotesk), sans-serif',
                  }}
                >
                  {props.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )

    case 'video':
      // Support multiple sources for video URL
      const vidUrl = props.videoUrl || props.videos?.[0]?.url || styling.backgroundVideo || ''
      const isYouTube = vidUrl.includes('youtube.com') || vidUrl.includes('youtu.be')
      const isVimeo = vidUrl.includes('vimeo.com')
      
      // Size settings
      const videoSize = props.size || 'large'
      const videoMaxWidth: Record<string, string> = {
        small: '400px',
        medium: '600px',
        large: '800px',
        xlarge: '1000px',
        full: '100%'
      }
      
      // Aspect ratio settings
      const aspectRatio = props.aspectRatio || '16:9'
      const videoAspectClass: Record<string, string> = {
        '16:9': 'aspect-video',
        '4:3': 'aspect-[4/3]',
        '1:1': 'aspect-square',
        '9:16': 'aspect-[9/16]',
        '21:9': 'aspect-[21/9]',
        'auto': ''
      }
      
      // Alignment settings
      const videoAlignment = props.alignment || 'center'
      const videoAlignClass: Record<string, string> = {
        left: 'mr-auto',
        center: 'mx-auto',
        right: 'ml-auto'
      }
      
      // Playback settings
      const videoAutoplay = props.autoplay ?? false
      const videoLoop = props.loop ?? false
      const videoShowControls = props.showControls ?? true
      
      // Convert YouTube/Vimeo URLs to embed format
      const getEmbedUrl = (url: string) => {
        const autoplayParam = videoAutoplay ? '&autoplay=1&mute=1' : ''
        const loopParam = videoLoop ? '&loop=1' : ''
        
        if (url.includes('youtube.com/watch')) {
          const videoId = url.split('v=')[1]?.split('&')[0]
          return `https://www.youtube.com/embed/${videoId}?rel=0${autoplayParam}${loopParam}`
        }
        if (url.includes('youtu.be/')) {
          const videoId = url.split('youtu.be/')[1]?.split('?')[0]
          return `https://www.youtube.com/embed/${videoId}?rel=0${autoplayParam}${loopParam}`
        }
        if (url.includes('vimeo.com/')) {
          const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
          return `https://player.vimeo.com/video/${videoId}?${videoAutoplay ? 'autoplay=1&muted=1' : ''}${videoLoop ? '&loop=1' : ''}`
        }
        return url
      }
      
      return (
        <div 
          className={`py-12 ${wrapperClass}`}
          style={{ background: getBackground(styling) }}
        >
          <div className="px-6" style={{ maxWidth: videoSize === 'full' ? '100%' : 'calc(100% - 48px)' }}>
            <div 
              className={`relative ${videoAspectClass[aspectRatio] || 'aspect-video'} bg-[#1a1a1a] border-4 border-[#353535] overflow-hidden ${videoAlignClass[videoAlignment]}`}
              style={{ 
                maxWidth: videoMaxWidth[videoSize],
                width: '100%'
              }}
            >
              {vidUrl ? (
                isYouTube || isVimeo ? (
                  <iframe
                    src={getEmbedUrl(vidUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={vidUrl}
                    className="w-full h-full object-cover"
                    controls={videoShowControls}
                    autoPlay={videoAutoplay && !isEditing}
                    muted={videoAutoplay}
                    loop={videoLoop}
                    playsInline
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[#CCAA4C] flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">▶</span>
                    </div>
                    <span className="text-[#666] font-bold uppercase">Add Video URL</span>
                  </div>
                </div>
              )}
            </div>
            {props.caption && (
              <p 
                className={`mt-4 text-[#888] text-sm ${videoAlignClass[videoAlignment]}`}
                style={{ 
                  maxWidth: videoMaxWidth[videoSize],
                  textAlign: videoAlignment as any 
                }}
              >
                {props.caption}
              </p>
            )}
          </div>
        </div>
      )

    // ============================================
    // TICKER BAR - Industrial News Strip
    // ============================================
    case 'tickerBar':
      // Icon mapping for text codes to emoji
      const iconMap: Record<string, string> = {
        'bolt': '⚡',
        'warning': '⚠️',
        'construction': '🔧',
        'gaming': '🎮',
        'radio': '📻',
        'fire': '🔥',
        'trophy': '🏆',
        'cart': '🛒',
      }
      const getIcon = (icon: string) => iconMap[icon] || icon
      
      const tickerItems = props.items || [
        { icon: '⚡', text: 'BREAKING NEWS', highlight: true },
        { icon: '⚠️', text: 'SHED ALERT', highlight: false },
        { icon: '🔧', text: 'UNDER CONSTRUCTION', highlight: false },
        { icon: '📻', text: 'NOW BROADCASTING', highlight: true },
      ]
      
      // Duplicate items for seamless loop (only on live site, not in editor)
      const allTickerItems = isEditing ? tickerItems : [...tickerItems, ...tickerItems]
      
      return (
        <div 
          className={`py-3 overflow-hidden ${wrapperClass}`}
          style={{ 
            background: getBackground(styling, '#C9A227'),
            borderTop: `3px solid ${styling.accentColor || '#8B7355'}`,
            borderBottom: `3px solid ${styling.accentColor || '#8B7355'}`,
          }}
        >
          <div 
            className={`flex items-center gap-12 whitespace-nowrap ${!isEditing ? 'animate-marquee' : ''}`}
            style={!isEditing ? { width: '200%' } : undefined}
          >
            {allTickerItems.map((item: any, i: number) => (
              <span 
                key={i} 
                className="font-black uppercase tracking-widest text-sm flex items-center gap-2"
                style={{ 
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: item.highlight ? '#8B0000' : '#353535',
                  fontStyle: 'italic',
                }}
              >
                <span>{getIcon(item.icon)}</span>
                {item.text}
                <span className="mx-4">★</span>
              </span>
            ))}
          </div>
        </div>
      )

    // ============================================
    // FEATURE MODULE GRID - MATCHING HOMEPAGE EXACTLY
    // ============================================
    case 'featureModuleGrid':
      const defaultModules = [
        { 
          type: 'game', 
          title: 'Man Cave Commander', 
          badge: 'Free to Play',
          subtitle: '🎮 Build • Customize • Dominate', 
          description: 'Build your ultimate man cave in 3D! Choose your room, place furniture, work on projects, and compete for the highest Atomic Rating.',
          accentColor: 'orange',
          features: [{ icon: '🏠', label: '4 Room Sizes' }, { icon: '🛋️', label: '50+ Items' }, { icon: '🕹️', label: 'Mini-Games' }, { icon: '🏆', label: 'Leaderboards' }],
          buttonText: 'Play Now',
          buttonSubtext: "— It's Free!",
        },
        { 
          type: 'store', 
          title: 'Garage Store', 
          badge: 'New Drops',
          subtitle: '🏷️ Merch • Gear • Essentials', 
          description: 'Rep the brand with official Atomic Tawk merch. Tees, caps, stickers, posters, and gear for the mechanically inclined.',
          accentColor: 'gold',
          features: [{ icon: '👕', label: 'Apparel' }, { icon: '🧢', label: 'Caps' }, { icon: '🖼️', label: 'Posters' }, { icon: '🔧', label: 'Gear' }],
          buttonText: 'Shop Now',
        },
        { 
          type: 'community', 
          title: 'The Community', 
          badge: 'Join Us',
          subtitle: '💬 Share • Connect • Whinge', 
          description: 'Join the conversation with fellow blokes. Share tips, get advice, show off your man cave, and have a proper whinge.',
          accentColor: 'green',
          features: [{ icon: '💡', label: 'Tips' }, { icon: '📸', label: 'Gallery' }, { icon: '🔧', label: 'Advice' }, { icon: '😤', label: 'Whinge' }],
          buttonText: 'Join Community',
        },
      ]
      const modules = props.modules || defaultModules
      
      return (
        <div 
          className={`py-12 ${wrapperClass}`}
          style={{ background: getBackground(styling) }}
        >
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((mod: any, i: number) => {
                const colors: Record<string, { accent: string, secondary: string }> = {
                  orange: { accent: '#FF6B35', secondary: '#CCAA4C' },
                  gold: { accent: '#CCAA4C', secondary: '#FF6B35' },
                  green: { accent: '#39FF14', secondary: '#CCAA4C' },
                }
                const color = colors[mod.accentColor] || colors.gold
                
                return (
                  <div 
                    key={i} 
                    className="relative overflow-hidden border-4"
                    style={{ 
                      background: 'linear-gradient(to bottom right, #353535, #1f1c13)',
                      borderColor: color.accent,
                    }}
                  >
                    {/* Corner badge */}
                    <div 
                      className="absolute top-0 right-0 px-4 py-1"
                      style={{ backgroundColor: color.accent }}
                    >
                      <span 
                        className="text-xs font-black uppercase tracking-widest"
                        style={{ color: mod.accentColor === 'orange' ? 'white' : '#353535' }}
                      >
                        {mod.badge || 'New'}
                      </span>
                    </div>
                    
                    {/* Background decorative icons - using Lucide like homepage */}
                    <div className="absolute inset-0 opacity-10 overflow-hidden">
                      <div className="absolute top-4 left-4" style={{ color: color.accent }}>
                        {mod.type === 'game' ? (
                          <Gamepad2 className="w-32 h-32" />
                        ) : mod.type === 'store' ? (
                          <ShoppingBag className="w-28 h-28" />
                        ) : (
                          <Users className="w-28 h-28" />
                        )}
                      </div>
                      <div className="absolute bottom-4 right-4 rotate-12" style={{ color: color.secondary }}>
                        {mod.type === 'game' ? (
                          <Trophy className="w-24 h-24" />
                        ) : mod.type === 'store' ? (
                          <Tag className="w-24 h-24" />
                        ) : (
                          <Camera className="w-24 h-24" />
                        )}
                      </div>
                    </div>
                    
                    <div className="relative p-8">
                      {/* Icon box - using Lucide icons like homepage */}
                      <div 
                        className="w-20 h-20 flex items-center justify-center mb-6 border-4"
                        style={{ 
                          backgroundColor: color.accent, 
                          borderColor: color.secondary,
                        }}
                      >
                        {mod.type === 'game' ? (
                          <Gamepad2 className="w-10 h-10 text-white" />
                        ) : mod.type === 'store' ? (
                          <ShoppingBag className="w-10 h-10 text-[#353535]" />
                        ) : (
                          <MessageSquare className="w-10 h-10 text-[#353535]" />
                        )}
                      </div>
                      
                      {/* Title */}
                      <h3 
                        className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2"
                        style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                      >
                        {mod.title}
                      </h3>
                      
                      {/* Subtitle with emoji */}
                      <p 
                        className="font-bold uppercase text-sm tracking-widest mb-4"
                        style={{ color: color.accent }}
                      >
                        {mod.subtitle}
                      </p>
                      
                      {/* Description */}
                      <p className="text-white/70 text-sm mb-6 max-w-md">
                        {mod.description}
                      </p>
                      
                      {/* Feature pills */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {(mod.features || []).map((feature: any, fi: number) => (
                          <div 
                            key={fi}
                            className="flex items-center gap-2 bg-white/10 px-3 py-1 border border-white/20"
                          >
                            <span>{feature.icon}</span>
                            <span className="text-white text-xs font-bold uppercase">{feature.label}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* CTA Button - using Lucide icons like homepage */}
                      <button 
                        className="group flex items-center gap-3 px-8 py-4 font-black uppercase text-sm tracking-widest transition-all border-2"
                        style={{ 
                          backgroundColor: color.accent,
                          borderColor: color.accent,
                          color: mod.accentColor === 'orange' ? 'white' : '#353535',
                        }}
                      >
                        {mod.type === 'game' ? (
                          <Zap className="w-5 h-5" />
                        ) : mod.type === 'store' ? (
                          <ShoppingBag className="w-5 h-5" />
                        ) : (
                          <Users className="w-5 h-5" />
                        )}
                        {mod.buttonText || 'Enter'}
                        {mod.buttonSubtext ? (
                          <span className="text-xs opacity-70">{mod.buttonSubtext}</span>
                        ) : mod.type !== 'game' && (
                          <Star className="w-4 h-4 opacity-70" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )

    // ============================================
    // ATOMIC TV BANNER - MATCHING HOMEPAGE EXACTLY
    // ============================================
    case 'atomicTVBanner':
      return (
        <div 
          className={`border-y-4 ${wrapperClass}`}
          style={{ 
            background: getBackground(styling, '#353535'), 
            borderColor: styling.accentColor || '#FF6B35',
          }}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row items-center">
              {/* Left - Icon & Branding */}
              <div 
                className="p-6 md:p-8 flex items-center gap-4 w-full md:w-auto shrink-0"
                style={{ backgroundColor: '#FF6B35' }}
              >
                <div className="w-16 h-16 bg-white flex items-center justify-center">
                  <span className="text-3xl">📺</span>
                </div>
                <div>
                  <h2 
                    className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {props.title || 'Atomic TV'}
                  </h2>
                  <p className="text-white/80 text-xs uppercase tracking-widest">
                    {props.subtitle || 'Official Broadcast Network'}
                  </p>
                </div>
              </div>
              
              {/* Middle - Description & Features */}
              <div className="flex-grow p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                <p className="text-white/70 text-sm md:text-base max-w-md text-center md:text-left">
                  {props.description || 'Burnouts, shed builds, gaming sessions, and mechanical mayhem. Watch the latest episodes and live broadcasts.'}
                </p>
                
                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {(props.categories || [
                    { icon: '🔥', label: 'Burnouts' },
                    { icon: '🔧', label: 'Builds' },
                    { icon: '🎮', label: 'Gaming' },
                    { icon: '📺', label: 'Live' },
                  ]).map((item: any, idx: number) => (
                    <span 
                      key={idx}
                      className="flex items-center gap-1 bg-white/10 px-3 py-1 text-white text-xs font-bold uppercase border border-white/20"
                    >
                      {item.icon} {item.label}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Right - CTA */}
              <div 
                className="p-6 md:p-8 w-full md:w-auto shrink-0"
                style={{ backgroundColor: '#252525' }}
              >
                <button 
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 font-black uppercase text-sm tracking-widest transition-all border-2"
                  style={{ 
                    backgroundColor: '#FF6B35',
                    borderColor: '#FF6B35',
                    color: 'white',
                  }}
                >
                  ▶ Watch Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )

    // ============================================
    // PROPAGANDA GRID (Featured Content) - Industrial Style
    // ============================================
    case 'propagandaGrid':
      const propBg = getBackground(styling, '#E3E2D5')
      const propBlockId = `propaganda-${block.id}`
      
      return (
        <div 
          id={propBlockId}
          className={wrapperClass}
          style={{ 
            padding: '64px 24px',
            minHeight: '300px',
            backgroundColor: propBg,
            background: propBg,
          }}
        >
            <div style={{ maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
              {/* Heading - matching FeaturedContent style */}
              <div className="flex items-center gap-6 mb-12">
                <h2 
                  className="text-3xl md:text-4xl font-black uppercase tracking-tighter bg-[#353535] text-white px-6 py-2"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {props.heading || 'Featured Propaganda'}
                </h2>
                <div className="flex-grow h-1 bg-[#353535]" />
              </div>
              
              {/* Cards grid - matching PosterCard style from FeaturedContent */}
              <div className={`grid gap-10 items-stretch ${
                props.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
                props.columns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {Array.from({ length: props.maxItems || 3 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="relative h-full flex flex-col bg-[#E3E2D5] p-4 border-4 border-[#353535]"
                    style={{ boxShadow: '8px 8px 0 #CCAA4C' }}
                  >
                    {/* Report Number Badge */}
                    <div className="absolute top-0 right-0 z-20 bg-[#353535] text-[#E3E2D5] text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                      Report #{String(i + 1).padStart(3, '0')}
                    </div>
                    
                    {/* Image Container with Gold Corner Accents */}
                    <div className="relative mb-4">
                      {/* Corner accents - gold */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-[#CCAA4C] z-10" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-[#CCAA4C] z-10" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-[#CCAA4C] z-10" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-[#CCAA4C] z-10" />
                      
                      {/* Image placeholder */}
                      <div className="aspect-[4/5] relative overflow-hidden bg-[#353535] flex items-center justify-center">
                        <span className="text-6xl text-[#CCAA4C] opacity-50">📰</span>
                      </div>
                    </div>
                    
                    {/* Title placeholder */}
                    <h3 
                      className="text-2xl font-black uppercase tracking-tight mb-2 text-[#353535]"
                      style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                    >
                      Article Title
                    </h3>
                    
                    {/* Description placeholder */}
                    <p className="text-sm italic text-[#353535]/70 mb-4 flex-grow">
                      Article description placeholder...
                    </p>
                    
                    {/* CTA Button */}
                    <div className="bg-[#353535] text-[#CCAA4C] text-center py-3 font-bold uppercase tracking-widest text-sm mt-auto">
                      View Report
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      )

    // ============================================
    // BROADCAST LIST
    // ============================================
    case 'broadcastList':
      const broadcastBg = getBackground(styling, '#E3E2D5')
      
      return (
        <div 
          className={`py-16 ${wrapperClass}`}
          style={{
            backgroundColor: broadcastBg,
            background: broadcastBg,
          }}
        >
            <div className="max-w-[1200px] mx-auto px-6">
              {/* Heading - right-aligned style */}
              <div className="flex items-center gap-6 mb-8 flex-row-reverse">
                <h2 
                  className="text-3xl md:text-4xl font-black uppercase tracking-tighter bg-[#353535] text-white px-6 py-2"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {props.heading || 'Latest Broadcasts'}
                </h2>
                <div className="flex-grow h-1 bg-[#353535]" />
              </div>
              
              {/* Broadcast items - matching LatestBroadcasts list style */}
              <div className="space-y-3">
                {Array.from({ length: props.maxItems || 5 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex gap-6 bg-white border-2 border-[#353535] p-4 hover:border-[#CCAA4C] transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-40 h-24 bg-[#353535] flex-shrink-0 flex items-center justify-center">
                      <span className="text-3xl text-[#CCAA4C]">📻</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase text-[#CCAA4C]">Category</span>
                        <span className="text-xs text-[#353535]/50">Jan 30, 2026</span>
                      </div>
                      <h4 
                        className="text-lg font-black uppercase tracking-tight text-[#353535] mb-1"
                        style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                      >
                        Broadcast Title {i + 1}
                      </h4>
                      <p className="text-sm text-[#353535]/70">
                        Brief description of the broadcast content...
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3 text-[#353535]/30">
                      <span>💬</span>
                      <span>📤</span>
                      <span>❤️</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* View All button */}
              <div className="mt-8 text-center">
                <span className="inline-block bg-transparent border-2 border-[#353535] text-[#353535] px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-[#353535] hover:text-white transition-colors cursor-pointer">
                  Access Full Archive
                </span>
              </div>
            </div>
        </div>
      )

    // ============================================
    // CATEGORY ICON GRID
    // ============================================
    case 'categoryIconGrid':
      // Match homepage default categories with images
      const defaultCategories = [
        { id: '1', imageUrl: '/images/categories/burnouts.png', label: 'Burnouts & Cars', link: '/shows/burnouts' },
        { id: '2', imageUrl: '/images/categories/shed.png', label: 'The Shed', link: '/shows/shed' },
        { id: '3', imageUrl: '/images/categories/gaming.png', label: 'Gaming', link: '/shows/gaming' },
        { id: '4', imageUrl: '/images/categories/store.png', label: 'Garage Store', link: '/store' },
        { id: '5', imageUrl: '/images/categories/weapons.png', label: 'Weapons', link: '/shows/weapons' },
        { id: '6', imageUrl: '/images/categories/storage.png', label: 'Storage', link: '/shows/storage' },
      ]
      const categories = props.categories || defaultCategories
      const catBg = getBackground(styling, '#1f1c13')
      
      return (
        <div 
          className={`py-16 border-t-8 border-[#CCAA4C] ${wrapperClass}`}
          style={{
            backgroundColor: catBg,
            background: catBg,
          }}
        >
            <div className="max-w-[1200px] mx-auto px-6">
              {/* Category grid - matching homepage 6-column layout (NO heading on actual homepage) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((cat: any, i: number) => {
                  const content = (
                    <>
                      <div className="w-32 h-32 mx-auto mb-4">
                        {cat.imageUrl ? (
                          <img 
                            src={cat.imageUrl} 
                            alt={cat.label} 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl opacity-50">
                            {cat.icon || '📁'}
                          </div>
                        )}
                      </div>
                      <span 
                        className="text-lg font-black uppercase tracking-tight text-[#CCAA4C]"
                        style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                      >
                        {cat.label}
                      </span>
                    </>
                  );

                  return cat.link ? (
                    <Link
                      key={cat.id || i}
                      href={cat.link}
                      className="bg-[#1f1c13] p-6 text-center hover:scale-105 transition-all group block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div 
                      key={cat.id || i} 
                      className="bg-[#1f1c13] p-6 text-center hover:scale-105 transition-all group"
                    >
                      {content}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )

    // ============================================
    // BRAND STATEMENT - PSA Layout (matching homepage)
    // ============================================
    case 'brandStatement':
      return (
        <div 
          className={`py-16 ${wrapperClass}`}
          style={{ background: getBackground(styling, '#C9A227') }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            {/* Quote marks around headline */}
            <h2 
              className="text-3xl md:text-5xl font-black italic uppercase tracking-tight mb-6"
              style={{ 
                fontFamily: 'var(--font-oswald), sans-serif',
                color: '#353535',
              }}
            >
              "{props.quote || props.headline || 'CIVIL DEFENCE PSA FOR HORSEPOWER'}"
            </h2>
            {/* Subtitle with bullet separator */}
            <p 
              className="text-sm md:text-base font-medium uppercase tracking-[0.3em] mb-8"
              style={{ 
                fontFamily: 'var(--font-oswald), sans-serif',
                color: '#353535',
              }}
            >
              {props.subtitle || props.subtext || 'BROADCASTING FROM THE SHED • APPROVED FOR MECHANICAL DISCUSSION'}
            </p>
          </div>
          {/* Bottom border stripe */}
          <div 
            className="h-2 mt-8"
            style={{ backgroundColor: '#353535' }}
          />
        </div>
      )

    // ============================================
    // IMAGE SLIDER
    // ============================================
    case 'imageSlider':
      const slides = props.slides || [
        { id: '1', imageUrl: '', title: 'Slide 1', subtitle: 'Add your first image', buttonText: '', buttonLink: '', overlay: true },
        { id: '2', imageUrl: '', title: 'Slide 2', subtitle: 'Add your second image', buttonText: '', buttonLink: '', overlay: true },
        { id: '3', imageUrl: '', title: 'Slide 3', subtitle: 'Add your third image', buttonText: '', buttonLink: '', overlay: true },
      ]
      const aspectRatioClass: Record<string, string> = {
        '16:9': 'aspect-video',
        '4:3': 'aspect-[4/3]',
        '21:9': 'aspect-[21/9]',
        '1:1': 'aspect-square',
        '3:2': 'aspect-[3/2]',
      }
      const sliderHeight = props.height || 'auto'
      const currentSlide = 0 // In preview, show first slide
      
      return (
        <div 
          className={`relative overflow-hidden ${wrapperClass}`}
          style={{ 
            background: getBackground(styling, '#1a1a1a'),
            height: sliderHeight !== 'auto' ? sliderHeight : undefined,
          }}
        >
          {/* Slides Container */}
          <div 
            className={`relative w-full ${sliderHeight === 'auto' ? aspectRatioClass[props.aspectRatio || '16:9'] : 'h-full'}`}
          >
            {slides.map((slide: any, i: number) => (
              <div 
                key={slide.id || i}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {/* Background Image */}
                {slide.imageUrl ? (
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title || `Slide ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#353535] to-[#1a1a1a] flex items-center justify-center">
                    <div className="text-center text-white/30">
                      <span className="text-6xl block mb-4">🖼️</span>
                      <span className="text-sm uppercase tracking-widest">Add Image</span>
                    </div>
                  </div>
                )}
                
                {/* Overlay Gradient */}
                {slide.overlay !== false && (slide.title || slide.subtitle || slide.buttonText) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                )}
                
                {/* Text Overlay */}
                {slide.overlay !== false && (slide.title || slide.subtitle || slide.buttonText) && (
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    {slide.title && (
                      <h2 
                        className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2"
                        style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                      >
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="text-lg md:text-xl text-white/80 mb-4 max-w-2xl">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.buttonText && (
                      <button 
                        className="px-8 py-3 bg-[#CCAA4C] text-[#353535] font-bold uppercase tracking-wider text-sm hover:bg-[#FF6B35] hover:text-white transition-colors"
                        style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                      >
                        {slide.buttonText}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          {props.showArrows !== false && slides.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-[#CCAA4C] text-white hover:text-[#353535] flex items-center justify-center transition-colors rounded-full">
                <span className="text-2xl">‹</span>
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-[#CCAA4C] text-white hover:text-[#353535] flex items-center justify-center transition-colors rounded-full">
                <span className="text-2xl">›</span>
              </button>
            </>
          )}
          
          {/* Dots Navigation */}
          {props.showDots !== false && slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_: any, i: number) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    i === currentSlide 
                      ? 'bg-[#CCAA4C] scale-125' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Slide Counter */}
          <div className="absolute top-4 right-4 z-20 bg-black/50 text-white px-3 py-1 text-sm font-bold">
            {currentSlide + 1} / {slides.length}
          </div>
          
          {/* Auto-play indicator */}
          {props.autoPlay !== false && (
            <div className="absolute top-4 left-4 z-20 bg-black/50 text-white/70 px-3 py-1 text-xs uppercase tracking-widest">
              ▶ Auto
            </div>
          )}
        </div>
      )

    // ============================================
    // DIVIDER
    // ============================================
    // ============================================
    // CARD GRID - 1, 2, or 3 column cards
    // ============================================
    case 'cardGrid':
      const cardColumns = props.columns || 3
      const cards = props.cards || []
      const cardAccent = styling.accentColor || '#CCAA4C'
      const cardTextColor = styling.textColor || '#E8E7DA'
      const buttonBgColor = props.buttonBgColor || cardAccent
      const buttonTextColor = props.buttonTextColor || '#1a1a1a'
      
      return (
        <div 
          className={`py-12 ${wrapperClass}`}
          style={{
            background: getBackground(styling),
          }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className={`grid gap-6 ${
              cardColumns === 1 ? 'grid-cols-1 max-w-2xl mx-auto' :
              cardColumns === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {cards.map((card: any, i: number) => (
                <div 
                  key={card.id || i}
                  className="bg-[#1a1a1a] border-4 border-[#353535] overflow-hidden"
                >
                  {props.showImages !== false && (
                    <div className="aspect-video bg-[#252525] flex items-center justify-center">
                      {card.image ? (
                        <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl opacity-30">🖼️</span>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <h3 
                      className="text-xl font-bold uppercase tracking-tight mb-2"
                      style={{ 
                        fontFamily: 'var(--font-oswald), sans-serif',
                        color: cardAccent,
                      }}
                    >
                      {card.title || 'Card Title'}
                    </h3>
                    <p 
                      className="text-sm mb-4"
                      style={{ color: cardTextColor }}
                    >
                      {card.description || 'Card description goes here.'}
                    </p>
                    {props.showButtons !== false && card.buttonText && (
                      <button 
                        className="px-4 py-2 font-bold uppercase text-sm border-2"
                        style={{
                          fontFamily: 'var(--font-oswald), sans-serif',
                          backgroundColor: buttonBgColor,
                          borderColor: '#353535',
                          color: buttonTextColor,
                        }}
                      >
                        {card.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    // ============================================
    // IMAGE COLUMNS - 1, 2, or 3 column images
    // ============================================
    case 'imageColumns':
      const imgColumns = props.columns || 2
      const images = props.images || []
      const imgAccent = styling.accentColor || '#CCAA4C'
      const captionColor = styling.textColor || '#888888'
      
      const aspectRatios: Record<string, string> = {
        '1:1': 'aspect-square',
        '4:3': 'aspect-[4/3]',
        '16:9': 'aspect-video',
        '3:2': 'aspect-[3/2]',
        '21:9': 'aspect-[21/9]',
      }
      
      const gapSizes: Record<string, string> = {
        small: 'gap-2',
        medium: 'gap-4',
        large: 'gap-8',
      }
      
      return (
        <div 
          className={`py-12 ${wrapperClass}`}
          style={{
            background: getBackground(styling),
          }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className={`grid ${gapSizes[props.gap || 'medium']} ${
              imgColumns === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
              imgColumns === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {images.map((img: any, i: number) => (
                <div key={img.id || i} className="group">
                  <div 
                    className={`${aspectRatios[props.aspectRatio || '16:9']} bg-[#252525] overflow-hidden ${
                      block.variant === 'rounded' ? 'rounded-lg' :
                      block.variant === 'framed' ? 'border-4 border-[#353535]' : ''
                    }`}
                  >
                    {img.src ? (
                      <img 
                        src={img.src} 
                        alt={img.alt || `Image ${i + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-20">📷</span>
                      </div>
                    )}
                  </div>
                  {props.showCaptions !== false && img.caption && (
                    <p 
                      className="mt-2 text-sm text-center"
                      style={{ color: captionColor }}
                    >
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    // ============================================
    // DIVIDER
    // ============================================
    case 'divider':
      const dividerStyles: Record<string, string> = {
        line: 'border-t-2 border-[#353535]',
        dashed: 'border-t-2 border-dashed border-[#353535]',
        dots: 'border-t-4 border-dotted border-[#CCAA4C]',
        industrial: 'h-4 bg-gradient-to-r from-transparent via-[#CCAA4C] to-transparent',
      }
      
      return (
        <div className={`max-w-6xl mx-auto px-6 py-8 ${wrapperClass}`}>
          <div className={dividerStyles[props.style || 'line']} />
        </div>
      )

    // ============================================
    // BLOKE SCIENCE SLIDER
    // ============================================
    case 'blokeScienceSlider':
      // Get facts from props or use defaults (10 cards)
      const scienceFacts = props.facts || [
        { id: '1', title: 'The First V8 Engine', fact: 'The first V8 engine was patented in 1902 by Léon Levavasseur, a French inventor. Originally designed for aircraft, the V8 configuration became the heart of American muscle cars by the 1960s.', type: 'text' },
        { id: '2', title: 'Burnout Physics', fact: 'A proper burnout can heat tyre rubber to over 200°C (392°F). The smoke you see is actually vaporized rubber particles mixed with superheated air. That\'s science, mate.', type: 'text' },
        { id: '3', title: 'The 10mm Socket Curse', fact: 'Studies show the average mechanic loses 3-5 10mm sockets per year. Scientists believe they may be slipping into a parallel dimension. No other explanation makes sense.', type: 'text' },
        { id: '4', title: 'Horsepower Origins', fact: 'James Watt coined "horsepower" in the 1780s to sell steam engines. He calculated one horse could do 33,000 foot-pounds of work per minute. Modern horses disagree.', type: 'text' },
        { id: '5', title: 'Shed Thermodynamics', fact: 'The average shed maintains a temperature exactly 15°C hotter than outside in summer and 15°C colder in winter. This is known as the Shed Paradox.', type: 'text' },
        { id: '6', title: 'Beer Can Engineering', fact: 'An empty beer can can support the weight of a grown man standing on it. However, the slightest dent causes catastrophic structural failure. Handle with care.', type: 'text' },
        { id: '7', title: 'Torque vs Power', fact: 'Torque is what pushes you back in your seat. Horsepower is how fast you stay pushed. Knowing the difference makes you 47% more interesting at BBQs.', type: 'text' },
        { id: '8', title: 'WD-40 Facts', fact: 'WD-40 was invented in 1953 on the 40th attempt (hence the name). It was originally designed to prevent corrosion on nuclear missiles. Now it fixes everything.', type: 'text' },
        { id: '9', title: 'Duct Tape Science', fact: 'Duct tape was invented during WWII to seal ammunition cases. Soldiers called it "duck tape" because water rolled off like a duck\'s back. It can fix literally anything.', type: 'text' },
        { id: '10', title: 'Garage Door Physics', fact: 'The average garage door travels over 1,500 kilometers in its lifetime. That\'s roughly the distance from Sydney to Brisbane. Your garage door is well-traveled.', type: 'text' },
      ]
      const visibleCards = props.visibleCards || 3
      
      return (
        <div 
          className={`py-16 border-y-8 ${wrapperClass}`}
          style={{ 
            background: getBackground(styling, '#353535'),
            borderColor: styling.accentColor || '#CCAA4C',
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6">
            {/* Section Heading - matching homepage */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex-1 h-[3px] bg-gradient-to-r from-transparent via-[#CCAA4C] to-[#CCAA4C]" />
              <h2 
                className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#E3E2D5] px-4"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {props.heading || 'Bloke Science'}
              </h2>
              <div className="flex-1 h-[3px] bg-gradient-to-l from-transparent via-[#CCAA4C] to-[#CCAA4C]" />
            </div>
            
            {/* Slider Cards - show all cards in preview */}
            <div className="relative">
              <div className="flex justify-center items-center gap-6 py-4 px-20 overflow-hidden">
                {scienceFacts.slice(0, visibleCards).map((fact: any, i: number) => {
                  const centerIndex = Math.floor(visibleCards / 2)
                  const isCenter = i === centerIndex
                  const isImage = fact.type === 'image'
                  
                  return (
                    <div
                      key={fact.id || i}
                      className={`
                        relative transition-all duration-500
                        border-4 border-[#353535]
                        ${isCenter ? 'scale-100 opacity-100 z-10' : 'scale-90 opacity-60 z-0'}
                        w-full max-w-sm shrink-0
                        ${isImage ? '' : 'bg-[#E3E2D5] p-6 md:p-8'}
                      `}
                      style={{
                        boxShadow: isCenter ? '8px 8px 0 #1a1a1a' : '4px 4px 0 #1a1a1a',
                      }}
                    >
                      {isImage ? (
                        // Image card
                        <div className="relative">
                          {fact.imageUrl ? (
                            <img 
                              src={fact.imageUrl} 
                              alt={fact.caption || 'Slide'} 
                              className="w-full aspect-[4/3] object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-[4/3] bg-[#E3E2D5] flex items-center justify-center">
                              <span className="text-4xl text-[#353535]/30">🖼️</span>
                            </div>
                          )}
                          {fact.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-[#353535]/90 text-white p-3 text-sm">
                              {fact.caption}
                            </div>
                          )}
                          {/* Number badge */}
                          <div className="absolute top-4 left-4 bg-[#FF6B35] text-white px-2 py-1 text-[10px] font-black">
                            #{i + 1}
                          </div>
                        </div>
                      ) : (
                        // Text fact card
                        <>
                          {/* Did You Know stamp */}
                          <div 
                            className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider text-[#353535]/60"
                            style={{ 
                              transform: 'rotate(-5deg)',
                              border: '2px dashed #353535',
                              padding: '2px 8px',
                            }}
                          >
                            Did You Know?
                          </div>
                          
                          {/* Number badge */}
                          <div className="absolute top-4 left-4 bg-[#FF6B35] text-white px-2 py-1 text-[10px] font-black">
                            #{i + 1}
                          </div>
                          
                          <h3 
                            className="text-xl md:text-2xl font-black uppercase mb-4 text-[#353535] pr-24 pt-6"
                            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                          >
                            {fact.title}
                          </h3>
                          <p className="font-mono text-sm text-[#353535]/80 leading-relaxed">
                            {fact.fact}
                          </p>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Navigation buttons */}
              <button className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-[#CCAA4C] hover:bg-[#FF6B35] text-[#353535] hover:text-white flex items-center justify-center transition-colors shadow-lg">
                <span className="text-xl">‹</span>
              </button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-[#CCAA4C] hover:bg-[#FF6B35] text-[#353535] hover:text-white flex items-center justify-center transition-colors shadow-lg">
                <span className="text-xl">›</span>
              </button>
            </div>
            
            {/* Progress dots - show for all cards */}
            <div className="flex justify-center gap-2 mt-6">
              {scienceFacts.map((_: any, i: number) => (
                <div
                  key={i}
                  className={`w-3 h-3 transition-all ${
                    i === Math.floor(visibleCards / 2) ? 'bg-[#CCAA4C] scale-125' : 'bg-[#E3E2D5]/50'
                  }`}
                />
              ))}
            </div>
            
            {/* Auto-play indicator */}
            {props.autoPlay !== false && (
              <div className="text-center mt-4">
                <span className="text-[#E3E2D5]/50 text-xs uppercase tracking-widest">
                  ⏸ Auto-playing
                </span>
              </div>
            )}
          </div>
        </div>
      )

    // ============================================
    // COMMUNITY FEED
    // ============================================
    case 'communityFeed':
      return (
        <div 
          className={`py-16 ${wrapperClass}`}
          style={{ background: getBackground(styling) }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <h2 
              className="text-3xl font-bold uppercase tracking-tight text-white mb-8"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {props.heading || 'Community Feed'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#252525] border-2 border-[#353535] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#CCAA4C] flex items-center justify-center text-[#1a1a1a] font-bold">
                      U
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">User Name</p>
                      <p className="text-[#666] text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <p className="text-[#888] text-sm">
                    Just finished installing the new headers on the V8. She sounds like a beast now! 🔥
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    // ============================================
    // PRODUCT EMBED / SHOWCASE
    // ============================================
    case 'productEmbed':
      const productLayout = props.layout || 'grid'
      const productColumns = props.columns || 4
      const productCount = props.maxItems || 4
      const showPrices = props.showPrices !== false
      const showAddToCart = props.showAddToCart !== false
      
      // Sample products for preview
      const sampleProducts = Array.from({ length: productCount }).map((_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: (19.99 + (i * 10)).toFixed(2),
        category: ['Apparel', 'Poster', 'Sticker', 'Gear'][i % 4],
      }))
      
      // Product Card Component
      const renderProductCard = (product: any, size: 'normal' | 'large' = 'normal') => (
        <div 
          key={product.id}
          className={`bg-[#252525] border-4 border-[#353535] overflow-hidden group hover:border-[#CCAA4C] transition-colors ${
            size === 'large' ? 'row-span-2' : ''
          }`}
        >
          <div className={`bg-[#353535] flex items-center justify-center ${
            size === 'large' ? 'aspect-[3/4]' : 'aspect-square'
          }`}>
            <span className={`opacity-30 ${size === 'large' ? 'text-8xl' : 'text-5xl'}`}>🛒</span>
          </div>
          <div className="p-4">
            <span className="text-[#CCAA4C] text-[10px] uppercase tracking-widest">{product.category}</span>
            <h3 
              className="text-white font-bold uppercase tracking-wide mb-2 text-sm"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {product.name}
            </h3>
            {showPrices && (
              <p className="text-[#CCAA4C] font-bold text-lg mb-3">
                ${product.price}
              </p>
            )}
            {showAddToCart && (
              <button className="w-full py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs hover:bg-[#FF6B35] hover:text-white transition-colors">
                Add to Cart
              </button>
            )}
          </div>
        </div>
      )
      
      return (
        <div 
          className={`py-12 ${wrapperClass}`}
          style={{ background: getBackground(styling, '#1a1a1a') }}
        >
          <div className="max-w-[1200px] mx-auto px-6">
            {/* Section Heading */}
            {props.heading && (
              <div className="flex items-center justify-between mb-8">
                <h2 
                  className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {props.heading}
                </h2>
                {props.viewAllText && (
                  <span className="text-[#CCAA4C] text-sm font-bold uppercase tracking-widest hover:text-white cursor-pointer">
                    {props.viewAllText} →
                  </span>
                )}
              </div>
            )}
            
            {/* Data Source Indicator */}
            <div className="mb-4 text-xs text-[#666] uppercase tracking-widest">
              {props.dataSource === 'featured' && '⭐ Featured Products'}
              {props.dataSource === 'latest' && '🆕 Latest Products'}
              {props.dataSource === 'category' && `📁 ${props.productCategory || 'All'} Products`}
              {props.dataSource === 'manual' && '✏️ Manual Selection'}
              {!props.dataSource && '⭐ Featured Products'}
            </div>
            
            {/* GRID LAYOUT */}
            {productLayout === 'grid' && (
              <div className={`grid gap-6 ${
                productColumns === 2 ? 'grid-cols-1 md:grid-cols-2' :
                productColumns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              }`}>
                {sampleProducts.map(p => renderProductCard(p))}
              </div>
            )}
            
            {/* CAROUSEL LAYOUT */}
            {productLayout === 'carousel' && (
              <div className="relative">
                <div className="flex gap-6 overflow-hidden">
                  {sampleProducts.slice(0, 4).map(p => (
                    <div key={p.id} className="w-64 shrink-0">
                      {renderProductCard(p)}
                    </div>
                  ))}
                </div>
                <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-[#CCAA4C] text-[#353535] flex items-center justify-center rounded-full shadow-lg">
                  ‹
                </button>
                <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-[#CCAA4C] text-[#353535] flex items-center justify-center rounded-full shadow-lg">
                  ›
                </button>
              </div>
            )}
            
            {/* FEATURED LAYOUT (1 large + small) */}
            {productLayout === 'featured' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 md:row-span-2">
                  {renderProductCard(sampleProducts[0], 'large')}
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                  {sampleProducts.slice(1, 5).map(p => renderProductCard(p))}
                </div>
              </div>
            )}
            
            {/* LIST LAYOUT */}
            {productLayout === 'list' && (
              <div className="space-y-4">
                {sampleProducts.map(p => (
                  <div 
                    key={p.id}
                    className="flex gap-6 bg-[#252525] border-4 border-[#353535] p-4 hover:border-[#CCAA4C] transition-colors"
                  >
                    <div className="w-24 h-24 bg-[#353535] flex items-center justify-center shrink-0">
                      <span className="text-3xl opacity-30">🛒</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[#CCAA4C] text-[10px] uppercase tracking-widest">{p.category}</span>
                      <h3 
                        className="text-white font-bold uppercase tracking-wide text-lg"
                        style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                      >
                        {p.name}
                      </h3>
                      {showPrices && (
                        <p className="text-[#CCAA4C] font-bold text-xl">
                          ${p.price}
                        </p>
                      )}
                    </div>
                    {showAddToCart && (
                      <div className="flex items-center">
                        <button className="px-6 py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs">
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )

    // ============================================
    // DEFAULT FALLBACK
    // ============================================
    default:
      return (
        <div className={`p-8 border-2 border-dashed border-[#CCAA4C]/30 ${wrapperClass}`}>
          <div className="bg-[#252525] p-6 rounded text-center">
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm text-[#CCAA4C] uppercase tracking-wide mb-1">
              {block.type}
            </div>
            <p className="text-[#666] text-xs">
              Block preview not available
            </p>
          </div>
        </div>
      )
  }
  } // end renderContent
  
  // Wrap content with spacing if needed
  return wrapWithSpacing(renderContent())
}
