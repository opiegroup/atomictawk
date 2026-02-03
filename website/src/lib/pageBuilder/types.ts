// ============================================
// ATOMIC TAWK PAGE BUILDER - BLOCK SCHEMA
// ============================================

// Theme Colors (non-negotiable)
export const THEME_COLORS = {
  gold: '#CCAA4C',
  orange: '#FF6B35',
  black: '#1a1a1a',
  charcoal: '#353535',
  cream: '#E3E2D5',
  green: '#39FF14', // Gaming/Community only
  white: '#FFFFFF',
} as const

export type ThemeColor = keyof typeof THEME_COLORS

// Block Categories
export type BlockCategory = 
  | 'hero' 
  | 'content' 
  | 'media' 
  | 'community' 
  | 'commerce' 
  | 'layout'
  | 'atomic' // Atomic Tawk specific blocks

// Block Types - Including all Atomic Tawk specific blocks
export type BlockType =
  // Generic blocks
  | 'hero'
  | 'richText'
  | 'ctaStrip'
  | 'poster'
  | 'video'
  | 'divider'
  | 'communityFeed'
  | 'productEmbed'
  | 'categoryTileGrid'
  | 'featureGrid'
  | 'imageGallery'
  | 'buttonGroup'
  // Card and Column layouts
  | 'cardGrid'
  | 'imageColumns'
  // Atomic Tawk specific blocks
  | 'atomicHero'
  | 'tickerBar'
  | 'featureModuleGrid'
  | 'atomicTVBanner'
  | 'propagandaGrid'
  | 'blokeScienceSlider'
  | 'broadcastList'
  | 'categoryIconGrid'
  | 'brandStatement'
  | 'imageSlider'
  | 'simpleImage'

// ============================================
// ATOMIC TAWK SPECIFIC BLOCK PROPS
// ============================================

// Atomic Hero - Main homepage hero
export interface AtomicHeroBlockProps {
  logoUrl: string
  headline: string
  subheadline: string
  primaryButtonText: string
  primaryButtonLink: string
  secondaryButtonText: string
  secondaryButtonLink: string
  showDecorativeGears: boolean
}

// Ticker Bar
export interface TickerBarBlockProps {
  items: Array<{
    id: string
    icon: 'bolt' | 'warning' | 'construction' | 'gaming'
    text: string
    highlight: boolean
  }>
  speed: 'slow' | 'normal' | 'fast'
}

// Feature Module Grid (Game, Store, Community)
export interface FeatureModuleGridBlockProps {
  modules: Array<{
    id: string
    type: 'game' | 'store' | 'community' | 'custom'
    title: string
    subtitle: string
    description: string
    features: Array<{ icon: string; label: string }>
    buttonText: string
    buttonLink: string
    accentColor: 'orange' | 'gold' | 'green'
    badge: string
  }>
}

// Atomic TV Banner
export interface AtomicTVBannerBlockProps {
  title: string
  subtitle: string
  description: string
  features: Array<{ icon: string; label: string }>
  buttonText: string
  buttonLink: string
}

// Propaganda Grid (Poster Cards)
export interface PropagandaGridBlockProps {
  heading: string
  posters: Array<{
    id: string
    title: string
    description: string
    imageUrl: string
    link: string
    reportNumber: string
    buttonText: string
  }>
  columns: 2 | 3 | 4
}

// Bloke Science Slider
export interface BlokeScienceSliderBlockProps {
  heading: string
  facts: Array<{
    id: string
    title: string
    fact: string
  }>
  autoPlay: boolean
  interval: number
}

// Broadcast List (Archive Feed)
export interface BroadcastListBlockProps {
  heading: string
  headingVariant: 'left' | 'right' | 'center'
  broadcasts: Array<{
    id: string
    title: string
    date: string
    thumbnailUrl: string
    link: string
  }>
  showViewAllButton: boolean
  viewAllLink: string
  viewAllText: string
}

// Category Icon Grid
export interface CategoryIconGridBlockProps {
  categories: Array<{
    id: string
    imageUrl: string
    label: string
    link: string
  }>
}

// Brand Statement
export interface BrandStatementBlockProps {
  quote: string
  subtitle: string
}

// ============================================
// GENERIC BLOCK PROPS (existing)
// ============================================

export interface HeroBlockProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  overlayOpacity: number
  buttonText?: string
  buttonLink?: string
  alignment: 'left' | 'center' | 'right'
}

export type HeroVariant = 'centered' | 'split' | 'poster' | 'minimal'

export interface RichTextBlockProps {
  heading?: string
  headingSize: 'small' | 'medium' | 'large'
  body: string
  alignment: 'left' | 'center' | 'right'
}

export type RichTextVariant = 'default' | 'highlight' | 'boxed'

export interface CTAStripBlockProps {
  text: string
  buttonText: string
  buttonLink: string
}

export type CTAStripVariant = 'black' | 'gold' | 'warning'

export interface PosterBlockProps {
  image: string
  caption?: string
  ctaText?: string
  ctaLink?: string
}

export type PosterVariant = 'fullWidth' | 'framed' | 'tilted'

export interface VideoBlockProps {
  videos: Array<{
    id: string
    url: string
    caption?: string
  }>
  layout: 'single' | 'grid' | 'fullWidth'
}

export type VideoVariant = 'default' | 'cinematic' | 'compact'

export interface CommunityFeedBlockProps {
  feedType: 'latest' | 'trending' | 'featured'
  maxItems: number
  showCaptions: boolean
  showUsernames: boolean
}

export type CommunityFeedVariant = 'grid' | 'carousel' | 'list'

export interface ProductEmbedBlockProps {
  productCategory: string
  productTag?: string
  maxItems: number
  ctaLink?: string
}

export type ProductEmbedVariant = 'grid' | 'carousel' | 'featured'

export interface DividerBlockProps {
  height: 'small' | 'medium' | 'large'
}

export type DividerVariant = 'atomic' | 'gear' | 'radiation' | 'simple'

export interface CategoryTileGridBlockProps {
  tiles: Array<{
    id: string
    icon: string
    label: string
    link: string
    accentColor: ThemeColor
  }>
  columns: 2 | 3 | 4 | 6
}

export type CategoryTileVariant = 'square' | 'wide' | 'compact'

export interface FeatureGridBlockProps {
  features: Array<{
    id: string
    icon: string
    title: string
    description: string
  }>
  columns: 2 | 3 | 4
}

export type FeatureGridVariant = 'cards' | 'minimal' | 'bordered'

export interface ImageGalleryBlockProps {
  images: Array<{
    id: string
    url: string
    alt?: string
    caption?: string
  }>
  columns: 2 | 3 | 4
}

export type ImageGalleryVariant = 'grid' | 'masonry' | 'slider'

// Button Group Block - Add buttons anywhere
export interface ButtonGroupBlockProps {
  buttons: Array<{
    id: string
    text: string
    link: string
    style: 'primary' | 'secondary' | 'outline' | 'ghost'
    size: 'small' | 'medium' | 'large'
    icon?: string
  }>
  alignment: 'left' | 'center' | 'right'
  spacing: 'tight' | 'normal' | 'wide'
  direction: 'horizontal' | 'vertical'
}

export type ButtonGroupVariant = 'default' | 'stacked' | 'pill'

// ============================================
// COMMON BLOCK STYLING (applies to all blocks)
// ============================================

export interface BlockButton {
  id: string
  text: string
  link: string
  style: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'small' | 'medium' | 'large'
  icon?: string
}

// Button positioning within blocks
export interface ButtonsConfig {
  position: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right' | 'center' | 'inline'
  spacing: 'tight' | 'normal' | 'wide'
  direction: 'horizontal' | 'vertical'
  marginTop?: number
  marginBottom?: number
}

export interface BlockStyling {
  // Background
  backgroundColor?: string // hex or theme color key
  backgroundGradient?: string // e.g., 'linear-gradient(to right, #CCAA4C, #FF6B35)'
  backgroundImage?: string // URL or uploaded path
  backgroundVideo?: string // URL or uploaded path for video backgrounds
  backgroundOverlay?: number // opacity 0-100
  backgroundBlur?: boolean
  
  // Texture overlay
  textureOverlay?: 'none' | 'halftone' | 'noise' | 'scanlines' | 'metal' | 'paper'
  textureOpacity?: number // 0-100
  
  // Frame/Border
  frameStyle?: 'none' | 'solid' | 'thick' | 'industrial' | 'double' | 'dashed'
  frameColor?: string
  borderRadius?: 'none' | 'small' | 'medium' | 'large'
  
  // Spacing
  paddingTop?: 'none' | 'small' | 'medium' | 'large' | 'xlarge'
  paddingBottom?: 'none' | 'small' | 'medium' | 'large' | 'xlarge'
  
  // Colors
  accentColor?: string
  textColor?: string
}

// ============================================
// PAGE BLOCK STRUCTURE
// ============================================

export interface PageBlock {
  id: string
  type: BlockType
  props: Record<string, any>
  variant: string
  order: number
  visible: boolean
  // Common styling options for all blocks
  styling?: BlockStyling
  // Additional buttons that can be added to any block
  buttons?: BlockButton[]
  // Button positioning configuration
  buttonsConfig?: ButtonsConfig
}

// ============================================
// GLOBAL PAGE SETTINGS
// ============================================

export interface PageGlobals {
  theme: 'atomic-dark' | 'atomic-light'
  headerStyle: 'full' | 'minimal' | 'hidden'
  footerVariant: 'default' | 'minimal' | 'expanded'
  backgroundTexture: 'plain' | 'metal' | 'poster-paper' | 'concrete'
  seo: {
    title: string
    description: string
    ogImage?: string
  }
}

// ============================================
// FULL PAGE LAYOUT
// ============================================

export interface PageLayout {
  globals: PageGlobals
  blocks: PageBlock[]
}

// ============================================
// BLOCK LIBRARY DEFINITIONS
// ============================================

export interface BlockDefinition {
  type: BlockType
  name: string
  description: string
  icon: string
  category: BlockCategory
  defaultProps: Record<string, any>
  defaultVariant: string
  variants: string[]
}

export const BLOCK_LIBRARY: BlockDefinition[] = [
  // ============================================
  // ATOMIC TAWK SPECIFIC BLOCKS
  // ============================================
  {
    type: 'atomicHero',
    name: 'Atomic Hero',
    description: 'Main hero with logo, headline & decorative gears',
    icon: '☢️',
    category: 'atomic',
    defaultProps: {
      logoUrl: '/logo.png',
      headline: 'Tawk Loud.\nDrive Louder.\nFeel Prouder.',
      subheadline: 'Where real blokes talk torque.',
      primaryButtonText: 'Start Broadcast',
      primaryButtonLink: '/shows',
      secondaryButtonText: 'Garage Store',
      secondaryButtonLink: '/store',
      showDecorativeGears: true,
    },
    defaultVariant: 'default',
    variants: ['default', 'compact', 'centered'],
  },
  {
    type: 'tickerBar',
    name: 'Ticker Bar',
    description: 'Animated scrolling news ticker',
    icon: '📢',
    category: 'atomic',
    defaultProps: {
      items: [
        { id: '1', icon: 'bolt', text: 'SIGNAL STRENGTH: OPTIMAL', highlight: true },
        { id: '2', icon: 'warning', text: 'CAUTION: HIGH OCTANE CONTENT AHEAD', highlight: false },
        { id: '3', icon: 'construction', text: 'NEW BUILD LOG: THE RUST-BUCKET SPECIAL', highlight: true },
        { id: '4', icon: 'gaming', text: 'GAMING UPDATE: WASTELAND CHRONICLES V2.0', highlight: false },
      ],
      speed: 'normal',
    },
    defaultVariant: 'default',
    variants: ['default'],
  },
  {
    type: 'featureModuleGrid',
    name: 'Feature Modules',
    description: 'Game, Store & Community modules',
    icon: '🎯',
    category: 'atomic',
    defaultProps: {
      modules: [
        {
          id: '1',
          type: 'game',
          title: 'Man Cave Commander',
          subtitle: '🎮 Build • Customize • Dominate',
          description: 'Build your ultimate man cave in 3D! Choose your room, place furniture, work on projects.',
          features: [
            { icon: '🏠', label: '4 Room Sizes' },
            { icon: '🛋️', label: '50+ Items' },
            { icon: '🕹️', label: 'Mini-Games' },
            { icon: '🏆', label: 'Leaderboards' },
          ],
          buttonText: 'Play Now',
          buttonLink: '/game',
          accentColor: 'orange',
          badge: 'Free to Play',
        },
        {
          id: '2',
          type: 'store',
          title: 'Garage Store',
          subtitle: '🏷️ Merch • Gear • Essentials',
          description: 'Rep the brand with official Atomic Tawk merch. Tees, caps, stickers, posters.',
          features: [
            { icon: '👕', label: 'Apparel' },
            { icon: '🧢', label: 'Caps' },
            { icon: '🖼️', label: 'Posters' },
            { icon: '🔧', label: 'Gear' },
          ],
          buttonText: 'Shop Now',
          buttonLink: '/store',
          accentColor: 'gold',
          badge: 'New Drops',
        },
        {
          id: '3',
          type: 'community',
          title: 'The Community',
          subtitle: '💬 Share • Connect • Whinge',
          description: 'Join the conversation with fellow blokes. Share tips, get advice, show off.',
          features: [
            { icon: '💡', label: 'Tips' },
            { icon: '📸', label: 'Gallery' },
            { icon: '🔧', label: 'Advice' },
            { icon: '😤', label: 'Whinge' },
          ],
          buttonText: 'Join Community',
          buttonLink: '/community',
          accentColor: 'green',
          badge: 'Join Us',
        },
      ],
    },
    defaultVariant: 'default',
    variants: ['default', 'compact'],
  },
  {
    type: 'atomicTVBanner',
    name: 'Atomic TV Banner',
    description: 'Horizontal TV broadcast banner',
    icon: '📺',
    category: 'atomic',
    defaultProps: {
      title: 'Atomic TV',
      subtitle: 'Official Broadcast Network',
      description: 'Burnouts, shed builds, gaming sessions, and mechanical mayhem.',
      features: [
        { icon: '🔥', label: 'Burnouts' },
        { icon: '🔧', label: 'Builds' },
        { icon: '🎮', label: 'Gaming' },
        { icon: '📺', label: 'Live' },
      ],
      buttonText: 'Watch Now',
      buttonLink: '/tv',
    },
    defaultVariant: 'default',
    variants: ['default', 'compact'],
  },
  {
    type: 'propagandaGrid',
    name: 'Propaganda Grid',
    description: 'Featured propaganda poster cards',
    icon: '🖼️',
    category: 'atomic',
    defaultProps: {
      heading: 'Featured Propaganda',
      posters: [
        {
          id: '1',
          title: 'Rubber vs. Asphalt',
          description: 'Kinetic energy distribution in high-friction environments.',
          imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
          link: '/shows/burnouts',
          reportNumber: 'Report #001',
          buttonText: 'Analyze Data',
        },
        {
          id: '2',
          title: 'Citizen Engineering',
          description: 'Manual labor and technical ingenuity for the modern era.',
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
          link: '/shows/shed',
          reportNumber: 'Bulletin #102',
          buttonText: 'Study Blueprints',
        },
        {
          id: '3',
          title: 'Digital Fallout',
          description: 'Simulated survival in post-atomic landscapes.',
          imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
          link: '/shows/gaming',
          reportNumber: 'Log #2077',
          buttonText: 'Initiate Simulation',
        },
      ],
      columns: 3,
    },
    defaultVariant: 'default',
    variants: ['default', 'compact'],
  },
  {
    type: 'blokeScienceSlider',
    name: 'Bloke Science Slider',
    description: 'Animated facts slider with auto-play',
    icon: '🔬',
    category: 'atomic',
    defaultProps: {
      heading: 'Bloke Science',
      facts: [
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
      ],
      autoPlay: true,
      interval: 5000,
    },
    defaultVariant: 'default',
    variants: ['default'],
  },
  {
    type: 'broadcastList',
    name: 'Broadcast List',
    description: 'Archive feed of latest broadcasts',
    icon: '📻',
    category: 'atomic',
    defaultProps: {
      heading: 'Latest Broadcasts',
      headingVariant: 'right',
      broadcasts: [
        { id: '1', title: 'The V8 Restoration: Part IV', date: 'August 14, 2077', thumbnailUrl: '', link: '/shows' },
        { id: '2', title: 'Arcade Survival Tactics', date: 'August 12, 2077', thumbnailUrl: '', link: '/shows' },
        { id: '3', title: 'Shed Build: The Rust-Bucket Special', date: 'August 10, 2077', thumbnailUrl: '', link: '/shows' },
      ],
      showViewAllButton: true,
      viewAllLink: '/shows',
      viewAllText: 'Access Full Archive',
    },
    defaultVariant: 'default',
    variants: ['default', 'compact'],
  },
  {
    type: 'categoryIconGrid',
    name: 'Category Icons',
    description: 'Quick link category icons',
    icon: '🏷️',
    category: 'atomic',
    defaultProps: {
      categories: [
        { id: '1', imageUrl: '/images/categories/burnouts.png', label: 'Burnouts & Cars', link: '/shows/burnouts' },
        { id: '2', imageUrl: '/images/categories/shed.png', label: 'The Shed', link: '/shows/shed' },
        { id: '3', imageUrl: '/images/categories/gaming.png', label: 'Gaming', link: '/shows/gaming' },
        { id: '4', imageUrl: '/images/categories/store.png', label: 'Garage Store', link: '/store' },
        { id: '5', imageUrl: '/images/categories/weapons.png', label: 'Weapons', link: '/shows/weapons' },
        { id: '6', imageUrl: '/images/categories/storage.png', label: 'Storage', link: '/shows/storage' },
      ],
    },
    defaultVariant: 'default',
    variants: ['default', 'compact'],
  },
  {
    type: 'brandStatement',
    name: 'Brand Statement',
    description: 'Gold banner with brand quote',
    icon: '💬',
    category: 'atomic',
    defaultProps: {
      quote: '"Civil Defence PSA for Horsepower"',
      subtitle: 'Broadcasting from the Shed • Approved for Mechanical Discussion',
    },
    defaultVariant: 'default',
    variants: ['default', 'dark'],
  },
  {
    type: 'imageSlider',
    name: 'Image Slider',
    description: 'Professional image carousel with optional text & button overlays',
    icon: '🖼️',
    category: 'atomic',
    defaultProps: {
      slides: [
        { id: '1', imageUrl: '', title: 'Slide 1', subtitle: '', buttonText: '', buttonLink: '', overlay: true },
        { id: '2', imageUrl: '', title: 'Slide 2', subtitle: '', buttonText: '', buttonLink: '', overlay: true },
        { id: '3', imageUrl: '', title: 'Slide 3', subtitle: '', buttonText: '', buttonLink: '', overlay: true },
      ],
      autoPlay: true,
      interval: 5000,
      showArrows: true,
      showDots: true,
      aspectRatio: '16:9',
      useGallery: false,
    },
    defaultVariant: 'default',
    variants: ['default', 'fullWidth', 'contained'],
  },

  // ============================================
  // GENERIC BLOCKS
  // ============================================
  {
    type: 'hero',
    name: 'Hero Banner',
    description: 'Large hero section with title, subtitle, and background',
    icon: '🎯',
    category: 'hero',
    defaultProps: {
      title: 'WELCOME TO ATOMIC TAWK',
      subtitle: 'Man Cave Culture',
      backgroundImage: '',
      overlayOpacity: 60,
      buttonText: '',
      buttonLink: '',
      alignment: 'center',
    },
    defaultVariant: 'centered',
    variants: ['centered', 'split', 'poster', 'minimal'],
  },
  {
    type: 'richText',
    name: 'Text Block',
    description: 'Heading and body text content',
    icon: '📝',
    category: 'content',
    defaultProps: {
      heading: '',
      headingSize: 'medium',
      body: '',
      alignment: 'left',
    },
    defaultVariant: 'default',
    variants: ['default', 'highlight', 'boxed'],
  },
  {
    type: 'ctaStrip',
    name: 'Call To Action',
    description: 'Attention-grabbing banner with button',
    icon: '📢',
    category: 'content',
    defaultProps: {
      text: 'Join the community',
      buttonText: 'Sign Up',
      buttonLink: '/signup',
    },
    defaultVariant: 'gold',
    variants: ['black', 'gold', 'warning'],
  },
  {
    type: 'poster',
    name: 'Poster',
    description: 'Propaganda-style poster image',
    icon: '🖼️',
    category: 'media',
    defaultProps: {
      image: '',
      caption: '',
      ctaText: '',
      ctaLink: '',
    },
    defaultVariant: 'framed',
    variants: ['fullWidth', 'framed', 'tilted'],
  },
  {
    type: 'simpleImage',
    name: 'Simple Image',
    description: 'Single image with optional scale and caption',
    icon: '🖼️',
    category: 'media',
    defaultProps: {
      imageUrl: '',
      alt: 'Image',
      caption: '',
      showCaption: false,
      scale: 100,
      alignment: 'center',
      maxWidth: 'full',
    },
    defaultVariant: 'default',
    variants: ['default', 'rounded', 'framed'],
  },
  {
    type: 'video',
    name: 'Video',
    description: 'Embedded video player',
    icon: '🎬',
    category: 'media',
    defaultProps: {
      videos: [],
      layout: 'single',
    },
    defaultVariant: 'default',
    variants: ['default', 'cinematic', 'compact'],
  },
  {
    type: 'divider',
    name: 'Divider',
    description: 'Visual separator between sections',
    icon: '➖',
    category: 'layout',
    defaultProps: {
      height: 'medium',
    },
    defaultVariant: 'atomic',
    variants: ['atomic', 'gear', 'radiation', 'simple'],
  },
  {
    type: 'buttonGroup',
    name: 'Button Group',
    description: 'Add one or more buttons anywhere',
    icon: '🔘',
    category: 'layout',
    defaultProps: {
      buttons: [
        { id: '1', text: 'Primary Action', link: '/', style: 'primary', size: 'medium', icon: '' },
        { id: '2', text: 'Secondary', link: '/', style: 'outline', size: 'medium', icon: '' },
      ],
      alignment: 'center',
      spacing: 'normal',
      direction: 'horizontal',
    },
    defaultVariant: 'default',
    variants: ['default', 'stacked', 'pill'],
  },
  {
    type: 'cardGrid',
    name: 'Card Grid',
    description: 'Cards in 1, 2, or 3 column layout',
    icon: '🃏',
    category: 'layout',
    defaultProps: {
      columns: 3,
      cards: [
        { id: '1', title: 'Card Title', description: 'Card description goes here.', image: '', link: '', buttonText: 'Learn More' },
        { id: '2', title: 'Card Title', description: 'Card description goes here.', image: '', link: '', buttonText: 'Learn More' },
        { id: '3', title: 'Card Title', description: 'Card description goes here.', image: '', link: '', buttonText: 'Learn More' },
      ],
      showImages: true,
      showButtons: true,
    },
    defaultVariant: 'default',
    variants: ['default', 'bordered', 'elevated'],
  },
  {
    type: 'imageColumns',
    name: 'Image Columns',
    description: 'Images in 1, 2, or 3 column layout with optional captions',
    icon: '🖼️',
    category: 'layout',
    defaultProps: {
      columns: 2,
      images: [
        { id: '1', src: '', alt: 'Image 1', caption: '' },
        { id: '2', src: '', alt: 'Image 2', caption: '' },
      ],
      showCaptions: true,
      aspectRatio: '16:9',
      gap: 'medium',
    },
    defaultVariant: 'default',
    variants: ['default', 'rounded', 'framed'],
  },
  {
    type: 'communityFeed',
    name: 'Community Feed',
    description: 'Display community uploads',
    icon: '👥',
    category: 'community',
    defaultProps: {
      feedType: 'latest',
      maxItems: 6,
      showCaptions: true,
      showUsernames: true,
    },
    defaultVariant: 'grid',
    variants: ['grid', 'carousel', 'list'],
  },
  {
    type: 'productEmbed',
    name: 'Product Showcase',
    description: 'Display store products',
    icon: '🛒',
    category: 'commerce',
    defaultProps: {
      productCategory: 'all',
      productTag: '',
      maxItems: 4,
      ctaLink: '/store',
    },
    defaultVariant: 'grid',
    variants: ['grid', 'carousel', 'featured'],
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return BLOCK_LIBRARY.find(b => b.type === type)
}

export function createNewBlock(type: BlockType): PageBlock {
  const definition = getBlockDefinition(type)
  if (!definition) throw new Error(`Unknown block type: ${type}`)
  
  return {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    props: { ...definition.defaultProps },
    variant: definition.defaultVariant,
    order: 0,
    visible: true,
  }
}

export function createDefaultPageLayout(): PageLayout {
  return {
    globals: {
      theme: 'atomic-dark',
      headerStyle: 'full',
      footerVariant: 'default',
      backgroundTexture: 'plain',
      seo: {
        title: '',
        description: '',
        ogImage: '',
      },
    },
    blocks: [],
  }
}

// Create the home page layout with all blocks
export function createHomePageLayout(): PageLayout {
  return {
    globals: {
      theme: 'atomic-light',
      headerStyle: 'full',
      footerVariant: 'default',
      backgroundTexture: 'plain',
      seo: {
        title: 'Atomic Tawk | Man Cave Culture',
        description: 'Tawk Loud. Drive Louder. Feel Prouder. Where real blokes talk torque.',
        ogImage: '/logo.png',
      },
    },
    blocks: [
      { ...createNewBlock('atomicHero'), id: 'home_hero', order: 0 },
      { ...createNewBlock('tickerBar'), id: 'home_ticker', order: 1 },
      { ...createNewBlock('featureModuleGrid'), id: 'home_modules', order: 2 },
      { ...createNewBlock('atomicTVBanner'), id: 'home_tv', order: 3 },
      { ...createNewBlock('propagandaGrid'), id: 'home_propaganda', order: 4 },
      { ...createNewBlock('blokeScienceSlider'), id: 'home_science', order: 5 },
      { ...createNewBlock('broadcastList'), id: 'home_broadcasts', order: 6 },
      { ...createNewBlock('categoryIconGrid'), id: 'home_categories', order: 7 },
      { ...createNewBlock('brandStatement'), id: 'home_brand', order: 8 },
    ],
  }
}
