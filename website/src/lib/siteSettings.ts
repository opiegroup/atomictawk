import { createClient } from "@supabase/supabase-js";

// Types
export interface SiteSettings {
  id: string;
  site_name: string;
  logo_url: string;
  tagline: string;
  contact_email: string;
  contact_phone: string | null;
  contact_address: string;
  radio_frequency: string;
  copyright_text: string;
  footer_tagline: string;
  established_text: string;
  newsletter_title: string;
  newsletter_description: string;
  newsletter_popup_title: string;
  newsletter_popup_description: string;
  newsletter_success_message: string;
  newsletter_fine_print: string;
  default_seo_title: string;
  default_seo_description: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  show_in_header: boolean;
  show_in_footer: boolean;
  show_on_contact: boolean;
}

export interface TickerMessage {
  id: string;
  text: string;
  icon: string;
  is_highlight: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface BlokeFact {
  id: string;
  title: string;
  fact: string;
  sort_order: number;
  is_active: boolean;
}

// Default values (fallbacks)
export const defaultSiteSettings: SiteSettings = {
  id: '',
  site_name: 'Atomic Tawk',
  logo_url: '/logo.png',
  tagline: 'Broadcasting from the heart of the shed since the atomic age. Keeping your engine humming and your tyre smoke thick.',
  contact_email: 'hello@atomictawk.com',
  contact_phone: null,
  contact_address: 'The Shed, Australia',
  radio_frequency: '104.2 FM',
  copyright_text: 'All Rights Reserved - Atomic Tawk Media',
  footer_tagline: 'Approved for Mechanical Discussion',
  established_text: 'Established 1955 - Rebuilt 2077',
  newsletter_title: 'Join the Broadcast',
  newsletter_description: 'Stay informed. Join the newsletter for weekly mechanical updates and shed tips.',
  newsletter_popup_title: 'Stay Tuned',
  newsletter_popup_description: 'Join the Atomic Tawk broadcast network. Get the latest broadcasts, shed tips, and exclusive content.',
  newsletter_success_message: 'Welcome to the Atomic Tawk community.',
  newsletter_fine_print: 'No spam. Unsubscribe anytime. We respect your inbox like we respect a clean engine bay.',
  default_seo_title: 'Atomic Tawk - Tawk Loud. Drive Louder. Feel Prouder.',
  default_seo_description: 'Where real blokes talk torque. Burnouts, shed builds, gaming, and mechanical mayhem.',
};

export const defaultSocialLinks: SocialLink[] = [
  { id: '1', platform: 'YouTube', url: '#', icon: 'youtube', sort_order: 1, is_active: true, show_in_header: false, show_in_footer: true, show_on_contact: true },
  { id: '2', platform: 'Instagram', url: '#', icon: 'instagram', sort_order: 2, is_active: true, show_in_header: false, show_in_footer: true, show_on_contact: true },
  { id: '3', platform: 'TikTok', url: '#', icon: 'tiktok', sort_order: 3, is_active: true, show_in_header: false, show_in_footer: true, show_on_contact: true },
  { id: '4', platform: 'X', url: '#', icon: 'twitter', sort_order: 4, is_active: true, show_in_header: false, show_in_footer: true, show_on_contact: true },
];

export const defaultTickerMessages: TickerMessage[] = [
  { id: '1', text: 'SIGNAL STRENGTH: OPTIMAL', icon: 'zap', is_highlight: false, sort_order: 1, is_active: true },
  { id: '2', text: 'CAUTION: HIGH OCTANE CONTENT AHEAD', icon: 'alert-triangle', is_highlight: true, sort_order: 2, is_active: true },
  { id: '3', text: 'NEW BUILD LOG: THE RUST-BUCKET SPECIAL', icon: 'wrench', is_highlight: false, sort_order: 3, is_active: true },
  { id: '4', text: 'GAMING UPDATE: WASTELAND CHRONICLES V2.0', icon: 'gamepad-2', is_highlight: false, sort_order: 4, is_active: true },
];

export const defaultBlokeFacts: BlokeFact[] = [
  { id: '1', title: 'ENGINE HEAT', fact: 'A running engine can reach temperatures of over 2000°C in the combustion chamber.', sort_order: 1, is_active: true },
  { id: '2', title: 'TYRE SCIENCE', fact: 'Racing tyres can reach temperatures of 100°C and actually get grippier when hot.', sort_order: 2, is_active: true },
  { id: '3', title: 'BRAKE POWER', fact: 'The average car brake generates enough heat to boil water in seconds.', sort_order: 3, is_active: true },
  { id: '4', title: 'FUEL FACTS', fact: 'A single litre of petrol contains about 34 megajoules of energy.', sort_order: 4, is_active: true },
  { id: '5', title: 'OIL PRESSURE', fact: 'Engine oil operates at pressures up to 80 PSI - that\'s serious pressure.', sort_order: 5, is_active: true },
  { id: '6', title: 'SPARK TIMING', fact: 'A spark plug fires about 400 times per second at 4800 RPM.', sort_order: 6, is_active: true },
  { id: '7', title: 'TURBO SPEED', fact: 'Turbochargers can spin at over 150,000 RPM - faster than a jet engine.', sort_order: 7, is_active: true },
  { id: '8', title: 'EXHAUST TEMPS', fact: 'Exhaust gases can exceed 900°C - hot enough to melt aluminium.', sort_order: 8, is_active: true },
  { id: '9', title: 'TORQUE FACTS', fact: 'Peak torque is where your engine feels strongest - usually mid-range RPM.', sort_order: 9, is_active: true },
  { id: '10', title: 'OCTANE RATING', fact: 'Higher octane fuel resists pre-ignition, allowing more aggressive timing.', sort_order: 10, is_active: true },
];

// Helper to get Supabase client for server-side fetching
function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Fetch site settings
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return defaultSiteSettings;

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      return defaultSiteSettings;
    }

    return data as SiteSettings;
  } catch (error) {
    console.log('Using default site settings');
    return defaultSiteSettings;
  }
}

// Fetch social links
export async function getSocialLinks(location?: 'footer' | 'header' | 'contact'): Promise<SocialLink[]> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return defaultSocialLinks;

    let query = supabase
      .from('social_links')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (location === 'footer') {
      query = query.eq('show_in_footer', true);
    } else if (location === 'header') {
      query = query.eq('show_in_header', true);
    } else if (location === 'contact') {
      query = query.eq('show_on_contact', true);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return location ? defaultSocialLinks.filter(l => {
        if (location === 'footer') return l.show_in_footer;
        if (location === 'header') return l.show_in_header;
        if (location === 'contact') return l.show_on_contact;
        return true;
      }) : defaultSocialLinks;
    }

    return data as SocialLink[];
  } catch (error) {
    console.log('Using default social links');
    return defaultSocialLinks;
  }
}

// Fetch ticker messages
export async function getTickerMessages(): Promise<TickerMessage[]> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return defaultTickerMessages;

    const { data, error } = await supabase
      .from('ticker_messages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error || !data || data.length === 0) {
      return defaultTickerMessages;
    }

    return data as TickerMessage[];
  } catch (error) {
    console.log('Using default ticker messages');
    return defaultTickerMessages;
  }
}

// Fetch bloke science facts
export async function getBlokeFacts(): Promise<BlokeFact[]> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return defaultBlokeFacts;

    const { data, error } = await supabase
      .from('bloke_science_facts')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error || !data || data.length === 0) {
      return defaultBlokeFacts;
    }

    return data as BlokeFact[];
  } catch (error) {
    console.log('Using default bloke facts');
    return defaultBlokeFacts;
  }
}
