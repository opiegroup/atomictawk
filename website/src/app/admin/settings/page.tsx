"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MediaUpload } from "@/components/pageBuilder/MediaUpload";
import { 
  Settings, Save, Loader2, Globe, Mail, Phone, MapPin, Radio,
  Share2, MessageSquare, Zap, Beaker, Plus, Trash2, GripVertical,
  Youtube, Instagram, Twitter, Facebook, ChevronDown, ChevronUp,
  FileText, Bell
} from "lucide-react";
import { useAuth, useRole, getSupabaseClient } from "@/lib/supabase";

interface SiteSettings {
  id: string;
  site_name: string;
  logo_url: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
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

interface SocialLink {
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

interface TickerMessage {
  id: string;
  text: string;
  icon: string;
  is_highlight: boolean;
  sort_order: number;
  is_active: boolean;
}

interface BlokeFact {
  id: string;
  title: string;
  fact: string;
  sort_order: number;
  is_active: boolean;
}

const defaultSettings: SiteSettings = {
  id: '',
  site_name: 'Atomic Tawk',
  logo_url: '/logo.png',
  tagline: 'Broadcasting from the heart of the shed since the atomic age.',
  contact_email: 'hello@atomictawk.com',
  contact_phone: '',
  contact_address: 'The Shed, Australia',
  radio_frequency: '104.2 FM',
  copyright_text: 'All Rights Reserved - Atomic Tawk Media',
  footer_tagline: 'Approved for Mechanical Discussion',
  established_text: 'Established 1955 - Rebuilt 2077',
  newsletter_title: 'Join the Broadcast',
  newsletter_description: 'Stay informed. Join the newsletter for weekly mechanical updates and shed tips.',
  newsletter_popup_title: 'Stay Tuned',
  newsletter_popup_description: 'Join the Atomic Tawk broadcast network.',
  newsletter_success_message: 'Welcome to the Atomic Tawk community.',
  newsletter_fine_print: 'No spam. Unsubscribe anytime.',
  default_seo_title: 'Atomic Tawk',
  default_seo_description: 'Where real blokes talk torque.',
};

const platformIcons: Record<string, any> = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: Share2,
};

const iconOptions = ['zap', 'alert-triangle', 'wrench', 'gamepad-2', 'radio', 'flame', 'gauge', 'cog', 'car', 'trophy'];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'ticker' | 'facts' | 'newsletter'>('general');
  
  // Data states
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [tickerMessages, setTickerMessages] = useState<TickerMessage[]>([]);
  const [blokeFacts, setBlokeFacts] = useState<BlokeFact[]>([]);

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    branding: true,
    contact: true,
    footer: true,
    seo: false,
  });

  // Auth check
  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, router]);

  // Load data
  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Load site settings - handle missing table
      try {
        const { data: settingsData, error } = await (supabase as any)
          .from('site_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (settingsData && !error) {
          setSettings(settingsData);
        }
      } catch (e) {
        console.log('Site settings table not found, using defaults');
      }

      // Load social links - handle missing table
      try {
        const { data: socialData } = await (supabase as any)
          .from('social_links')
          .select('*')
          .order('sort_order');
        if (socialData) setSocialLinks(socialData);
      } catch (e) {
        console.log('Social links table not found');
      }

      // Load ticker messages - handle missing table
      try {
        const { data: tickerData } = await (supabase as any)
          .from('ticker_messages')
          .select('*')
          .order('sort_order');
        if (tickerData) setTickerMessages(tickerData);
      } catch (e) {
        console.log('Ticker messages table not found');
      }

      // Load bloke facts - handle missing table
      try {
        const { data: factsData } = await (supabase as any)
          .from('bloke_science_facts')
          .select('*')
          .order('sort_order');
        if (factsData) setBlokeFacts(factsData);
      } catch (e) {
        console.log('Bloke facts table not found');
      }

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSaving(true);
    try {
      // Save site settings
      if (settings.id) {
        await (supabase as any)
          .from('site_settings')
          .update(settings)
          .eq('id', settings.id);
      } else {
        const { data } = await (supabase as any)
          .from('site_settings')
          .insert(settings)
          .select()
          .single();
        if (data) setSettings(data);
      }

      alert('Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert('Error saving: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Social Links CRUD
  const saveSocialLink = async (link: SocialLink) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      if (link.id) {
        await (supabase as any)
          .from('social_links')
          .update(link)
          .eq('id', link.id);
      } else {
        await (supabase as any)
          .from('social_links')
          .insert({ ...link, id: undefined });
      }
      await loadData();
    } catch (error) {
      console.error('Error saving social link:', error);
    }
  };

  const deleteSocialLink = async (id: string) => {
    if (!confirm('Delete this social link?')) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await (supabase as any).from('social_links').delete().eq('id', id);
    await loadData();
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, {
      id: '',
      platform: 'YouTube',
      url: '',
      icon: 'youtube',
      sort_order: socialLinks.length,
      is_active: true,
      show_in_header: false,
      show_in_footer: true,
      show_on_contact: true,
    }]);
  };

  // Ticker Messages CRUD
  const saveTickerMessage = async (msg: TickerMessage) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      if (msg.id) {
        await (supabase as any)
          .from('ticker_messages')
          .update(msg)
          .eq('id', msg.id);
      } else {
        await (supabase as any)
          .from('ticker_messages')
          .insert({ ...msg, id: undefined });
      }
      await loadData();
    } catch (error) {
      console.error('Error saving ticker message:', error);
    }
  };

  const deleteTickerMessage = async (id: string) => {
    if (!confirm('Delete this ticker message?')) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await (supabase as any).from('ticker_messages').delete().eq('id', id);
    await loadData();
  };

  const addTickerMessage = () => {
    setTickerMessages([...tickerMessages, {
      id: '',
      text: '',
      icon: 'zap',
      is_highlight: false,
      sort_order: tickerMessages.length,
      is_active: true,
    }]);
  };

  // Bloke Facts CRUD
  const saveBlokeFact = async (fact: BlokeFact) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      if (fact.id) {
        await (supabase as any)
          .from('bloke_science_facts')
          .update(fact)
          .eq('id', fact.id);
      } else {
        await (supabase as any)
          .from('bloke_science_facts')
          .insert({ ...fact, id: undefined });
      }
      await loadData();
    } catch (error) {
      console.error('Error saving bloke fact:', error);
    }
  };

  const deleteBlokeFact = async (id: string) => {
    if (!confirm('Delete this fact?')) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await (supabase as any).from('bloke_science_facts').delete().eq('id', id);
    await loadData();
  };

  const addBlokeFact = () => {
    setBlokeFacts([...blokeFacts, {
      id: '',
      title: '',
      fact: '',
      sort_order: blokeFacts.length,
      is_active: true,
    }]);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#CCAA4C]" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'ticker', label: 'Ticker Bar', icon: Zap },
    { id: 'facts', label: 'Bloke Science', icon: Beaker },
    { id: 'newsletter', label: 'Newsletter', icon: Bell },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#CCAA4C]" />
            Site Settings
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Configure site-wide settings and content
          </p>
        </div>
        {activeTab === 'general' && (
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-sm tracking-wider hover:bg-[#CCAA4C]/80 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#CCAA4C] text-[#1a1a1a]'
                  : 'bg-[#353535] text-[#888] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          {/* Branding Section */}
          <div className="bg-[#252525] border-2 border-[#353535] rounded overflow-hidden">
            <button
              onClick={() => toggleSection('branding')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#2a2a2a]"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#CCAA4C]" />
                <span className="font-bold text-white uppercase">Branding</span>
              </div>
              {expandedSections.branding ? <ChevronUp className="w-5 h-5 text-[#666]" /> : <ChevronDown className="w-5 h-5 text-[#666]" />}
            </button>
            {expandedSections.branding && (
              <div className="p-4 border-t border-[#353535] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Site Name</label>
                    <input
                      type="text"
                      value={settings.site_name}
                      onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    />
                  </div>
                  <MediaUpload
                    label="Logo"
                    value={settings.logo_url}
                    onChange={(url) => setSettings({ ...settings, logo_url: url })}
                    accept="image"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">Tagline</label>
                  <textarea
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="bg-[#252525] border-2 border-[#353535] rounded overflow-hidden">
            <button
              onClick={() => toggleSection('contact')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#2a2a2a]"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#CCAA4C]" />
                <span className="font-bold text-white uppercase">Contact Info</span>
              </div>
              {expandedSections.contact ? <ChevronUp className="w-5 h-5 text-[#666]" /> : <ChevronDown className="w-5 h-5 text-[#666]" />}
            </button>
            {expandedSections.contact && (
              <div className="p-4 border-t border-[#353535] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                      <Mail className="w-3 h-3 inline mr-1" /> Email
                    </label>
                    <input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                      <Phone className="w-3 h-3 inline mr-1" /> Phone
                    </label>
                    <input
                      type="text"
                      value={settings.contact_phone || ''}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                      <MapPin className="w-3 h-3 inline mr-1" /> Address
                    </label>
                    <input
                      type="text"
                      value={settings.contact_address}
                      onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">
                      <Radio className="w-3 h-3 inline mr-1" /> Radio Frequency
                    </label>
                    <input
                      type="text"
                      value={settings.radio_frequency}
                      onChange={(e) => setSettings({ ...settings, radio_frequency: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="bg-[#252525] border-2 border-[#353535] rounded overflow-hidden">
            <button
              onClick={() => toggleSection('footer')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#2a2a2a]"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#CCAA4C]" />
                <span className="font-bold text-white uppercase">Footer Text</span>
              </div>
              {expandedSections.footer ? <ChevronUp className="w-5 h-5 text-[#666]" /> : <ChevronDown className="w-5 h-5 text-[#666]" />}
            </button>
            {expandedSections.footer && (
              <div className="p-4 border-t border-[#353535] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Copyright Text</label>
                    <input
                      type="text"
                      value={settings.copyright_text}
                      onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Established Text</label>
                    <input
                      type="text"
                      value={settings.established_text}
                      onChange={(e) => setSettings({ ...settings, established_text: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">Footer Tagline</label>
                  <input
                    type="text"
                    value={settings.footer_tagline}
                    onChange={(e) => setSettings({ ...settings, footer_tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="bg-[#252525] border-2 border-[#353535] rounded overflow-hidden">
            <button
              onClick={() => toggleSection('seo')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#2a2a2a]"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#CCAA4C]" />
                <span className="font-bold text-white uppercase">SEO Defaults</span>
              </div>
              {expandedSections.seo ? <ChevronUp className="w-5 h-5 text-[#666]" /> : <ChevronDown className="w-5 h-5 text-[#666]" />}
            </button>
            {expandedSections.seo && (
              <div className="p-4 border-t border-[#353535] space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">Default Page Title</label>
                  <input
                    type="text"
                    value={settings.default_seo_title}
                    onChange={(e) => setSettings({ ...settings, default_seo_title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#888] mb-1">Default Meta Description</label>
                  <textarea
                    value={settings.default_seo_description}
                    onChange={(e) => setSettings({ ...settings, default_seo_description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#888]">{socialLinks.length} social links configured</p>
            <button
              onClick={addSocialLink}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-xs hover:bg-[#CCAA4C]/80"
            >
              <Plus className="w-3 h-3" />
              Add Link
            </button>
          </div>

          <div className="space-y-3">
            {socialLinks.map((link, index) => (
              <div key={link.id || index} className="bg-[#252525] border-2 border-[#353535] rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Platform</label>
                    <select
                      value={link.platform}
                      onChange={(e) => {
                        const updated = [...socialLinks];
                        updated[index] = { ...link, platform: e.target.value, icon: e.target.value.toLowerCase() };
                        setSocialLinks(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    >
                      <option value="YouTube">YouTube</option>
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="X">X (Twitter)</option>
                      <option value="Facebook">Facebook</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Discord">Discord</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">URL</label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...socialLinks];
                        updated[index] = { ...link, url: e.target.value };
                        setSocialLinks(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Order</label>
                    <input
                      type="number"
                      value={link.sort_order}
                      onChange={(e) => {
                        const updated = [...socialLinks];
                        updated[index] = { ...link, sort_order: parseInt(e.target.value) || 0 };
                        setSocialLinks(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.is_active}
                      onChange={(e) => {
                        const updated = [...socialLinks];
                        updated[index] = { ...link, is_active: e.target.checked };
                        setSocialLinks(updated);
                      }}
                      className="w-4 h-4 accent-[#CCAA4C]"
                    />
                    <span className="text-sm text-white">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.show_in_footer}
                      onChange={(e) => {
                        const updated = [...socialLinks];
                        updated[index] = { ...link, show_in_footer: e.target.checked };
                        setSocialLinks(updated);
                      }}
                      className="w-4 h-4 accent-[#CCAA4C]"
                    />
                    <span className="text-sm text-white">Show in Footer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.show_on_contact}
                      onChange={(e) => {
                        const updated = [...socialLinks];
                        updated[index] = { ...link, show_on_contact: e.target.checked };
                        setSocialLinks(updated);
                      }}
                      className="w-4 h-4 accent-[#CCAA4C]"
                    />
                    <span className="text-sm text-white">Show on Contact</span>
                  </label>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => saveSocialLink(link)}
                      className="px-3 py-1 bg-[#CCAA4C] text-[#1a1a1a] text-xs font-bold uppercase hover:bg-[#CCAA4C]/80"
                    >
                      Save
                    </button>
                    {link.id && (
                      <button
                        onClick={() => deleteSocialLink(link.id)}
                        className="p-1 text-[#666] hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticker Messages Tab */}
      {activeTab === 'ticker' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#888]">{tickerMessages.length} ticker messages</p>
            <button
              onClick={addTickerMessage}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-xs hover:bg-[#CCAA4C]/80"
            >
              <Plus className="w-3 h-3" />
              Add Message
            </button>
          </div>

          <div className="space-y-3">
            {tickerMessages.map((msg, index) => (
              <div key={msg.id || index} className="bg-[#252525] border-2 border-[#353535] rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Icon</label>
                    <select
                      value={msg.icon}
                      onChange={(e) => {
                        const updated = [...tickerMessages];
                        updated[index] = { ...msg, icon: e.target.value };
                        setTickerMessages(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-8">
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Message</label>
                    <input
                      type="text"
                      value={msg.text}
                      onChange={(e) => {
                        const updated = [...tickerMessages];
                        updated[index] = { ...msg, text: e.target.value };
                        setTickerMessages(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                      placeholder="Enter ticker message..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Order</label>
                    <input
                      type="number"
                      value={msg.sort_order}
                      onChange={(e) => {
                        const updated = [...tickerMessages];
                        updated[index] = { ...msg, sort_order: parseInt(e.target.value) || 0 };
                        setTickerMessages(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={msg.is_active}
                      onChange={(e) => {
                        const updated = [...tickerMessages];
                        updated[index] = { ...msg, is_active: e.target.checked };
                        setTickerMessages(updated);
                      }}
                      className="w-4 h-4 accent-[#CCAA4C]"
                    />
                    <span className="text-sm text-white">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={msg.is_highlight}
                      onChange={(e) => {
                        const updated = [...tickerMessages];
                        updated[index] = { ...msg, is_highlight: e.target.checked };
                        setTickerMessages(updated);
                      }}
                      className="w-4 h-4 accent-[#CCAA4C]"
                    />
                    <span className="text-sm text-white">Highlight (Yellow)</span>
                  </label>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => saveTickerMessage(msg)}
                      className="px-3 py-1 bg-[#CCAA4C] text-[#1a1a1a] text-xs font-bold uppercase hover:bg-[#CCAA4C]/80"
                    >
                      Save
                    </button>
                    {msg.id && (
                      <button
                        onClick={() => deleteTickerMessage(msg.id)}
                        className="p-1 text-[#666] hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bloke Science Facts Tab */}
      {activeTab === 'facts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#888]">{blokeFacts.length} bloke science facts</p>
            <button
              onClick={addBlokeFact}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-xs hover:bg-[#CCAA4C]/80"
            >
              <Plus className="w-3 h-3" />
              Add Fact
            </button>
          </div>

          <div className="space-y-3">
            {blokeFacts.map((fact, index) => (
              <div key={fact.id || index} className="bg-[#252525] border-2 border-[#353535] rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Title</label>
                    <input
                      type="text"
                      value={fact.title}
                      onChange={(e) => {
                        const updated = [...blokeFacts];
                        updated[index] = { ...fact, title: e.target.value };
                        setBlokeFacts(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                      placeholder="e.g., ENGINE HEAT"
                    />
                  </div>
                  <div className="md:col-span-7">
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Fact</label>
                    <input
                      type="text"
                      value={fact.fact}
                      onChange={(e) => {
                        const updated = [...blokeFacts];
                        updated[index] = { ...fact, fact: e.target.value };
                        setBlokeFacts(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                      placeholder="The interesting fact..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-[#888] mb-1">Order</label>
                    <input
                      type="number"
                      value={fact.sort_order}
                      onChange={(e) => {
                        const updated = [...blokeFacts];
                        updated[index] = { ...fact, sort_order: parseInt(e.target.value) || 0 };
                        setBlokeFacts(updated);
                      }}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fact.is_active}
                      onChange={(e) => {
                        const updated = [...blokeFacts];
                        updated[index] = { ...fact, is_active: e.target.checked };
                        setBlokeFacts(updated);
                      }}
                      className="w-4 h-4 accent-[#CCAA4C]"
                    />
                    <span className="text-sm text-white">Active</span>
                  </label>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => saveBlokeFact(fact)}
                      className="px-3 py-1 bg-[#CCAA4C] text-[#1a1a1a] text-xs font-bold uppercase hover:bg-[#CCAA4C]/80"
                    >
                      Save
                    </button>
                    {fact.id && (
                      <button
                        onClick={() => deleteBlokeFact(fact.id)}
                        className="p-1 text-[#666] hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Tab */}
      {activeTab === 'newsletter' && (
        <div className="space-y-4">
          <div className="bg-[#252525] border-2 border-[#353535] rounded p-4 space-y-4">
            <h3 className="font-bold text-white uppercase flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#CCAA4C]" />
              Footer Newsletter Section
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">Title</label>
                <input
                  type="text"
                  value={settings.newsletter_title}
                  onChange={(e) => setSettings({ ...settings, newsletter_title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">Description</label>
                <input
                  type="text"
                  value={settings.newsletter_description}
                  onChange={(e) => setSettings({ ...settings, newsletter_description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#252525] border-2 border-[#353535] rounded p-4 space-y-4">
            <h3 className="font-bold text-white uppercase flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#CCAA4C]" />
              Newsletter Popup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">Popup Title</label>
                <input
                  type="text"
                  value={settings.newsletter_popup_title}
                  onChange={(e) => setSettings({ ...settings, newsletter_popup_title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">Popup Description</label>
                <input
                  type="text"
                  value={settings.newsletter_popup_description}
                  onChange={(e) => setSettings({ ...settings, newsletter_popup_description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">Success Message</label>
                <input
                  type="text"
                  value={settings.newsletter_success_message}
                  onChange={(e) => setSettings({ ...settings, newsletter_success_message: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#888] mb-1">Fine Print</label>
                <input
                  type="text"
                  value={settings.newsletter_fine_print}
                  onChange={(e) => setSettings({ ...settings, newsletter_fine_print: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#353535] rounded text-white focus:border-[#CCAA4C] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#CCAA4C] text-[#1a1a1a] font-bold uppercase text-sm tracking-wider hover:bg-[#CCAA4C]/80 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Newsletter Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
