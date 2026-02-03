import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter, isBrevoConfigured } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Save to Supabase (internal record)
    const supabase = getSupabase();
    if (supabase) {
      try {
        console.log('Saving to Supabase newsletter_subscribers...');
        const { data, error } = await supabase.from('newsletter_subscribers').upsert({
          email: normalizedEmail,
          subscribed_to: ['general'],
          source: source || 'website',
          status: 'active',
        }, {
          onConflict: 'email',
        });
        
        if (error) {
          console.error('Supabase save error:', error);
        } else {
          console.log('Supabase save success:', data);
        }
      } catch (dbError) {
        console.log('Database save error:', dbError);
      }
    } else {
      console.log('Supabase client not available');
    }

    // Add to Brevo (email marketing)
    if (isBrevoConfigured()) {
      const result = await subscribeToNewsletter(normalizedEmail, name, source);
      
      if (!result.success) {
        console.error('Brevo subscription error:', result.error);
        // Don't fail the request, we still saved to Supabase
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
