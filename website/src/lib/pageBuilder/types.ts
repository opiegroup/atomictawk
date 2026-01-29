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
