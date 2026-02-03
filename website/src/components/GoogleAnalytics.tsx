'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

// Get GA4 Measurement ID from environment
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Only enable GA4 in production (not on localhost)
const isProduction = typeof window !== 'undefined' && 
  !window.location.hostname.includes('localhost') && 
  !window.location.hostname.includes('127.0.0.1');

// Track page views
function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Send pageview to GA4
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);
}

// Inner component that uses the hooks
function GoogleAnalyticsInner() {
  usePageTracking();
  return null;
}

// Main component
export function GoogleAnalytics() {
  // Don't load GA on localhost or if no measurement ID
  if (!GA_MEASUREMENT_ID || !isProduction) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {/* Page tracking component wrapped in Suspense */}
      <Suspense fallback={null}>
        <GoogleAnalyticsInner />
      </Suspense>
    </>
  );
}

// Helper function to track custom events
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  // Only track in production
  if (typeof window !== 'undefined' && window.gtag && isProduction) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Common event trackers
export const analytics = {
  // Content events
  viewContent: (contentId: string, contentTitle: string, contentType: string) => {
    trackEvent('view_content', 'content', `${contentType}: ${contentTitle}`, undefined);
  },
  
  // Store events
  viewProduct: (productId: string, productName: string, price: number) => {
    trackEvent('view_item', 'ecommerce', productName, price);
  },
  
  addToCart: (productId: string, productName: string, price: number) => {
    trackEvent('add_to_cart', 'ecommerce', productName, price);
  },
  
  beginCheckout: (value: number) => {
    trackEvent('begin_checkout', 'ecommerce', undefined, value);
  },
  
  purchase: (orderId: string, value: number) => {
    trackEvent('purchase', 'ecommerce', orderId, value);
  },
  
  // Engagement events
  subscribe: (source: string) => {
    trackEvent('subscribe', 'engagement', source);
  },
  
  contactForm: () => {
    trackEvent('contact_form_submit', 'engagement');
  },
  
  socialClick: (platform: string) => {
    trackEvent('social_click', 'engagement', platform);
  },
  
  // Video events
  videoPlay: (videoTitle: string) => {
    trackEvent('video_play', 'video', videoTitle);
  },
  
  videoComplete: (videoTitle: string) => {
    trackEvent('video_complete', 'video', videoTitle);
  },
};

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
