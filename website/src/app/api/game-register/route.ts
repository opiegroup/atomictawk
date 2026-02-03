import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter, isBrevoConfigured } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role key
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
    const { email, displayName, source, subscriptions } = body;

    console.log('[Game Register] Request:', { email, displayName, source, subscriptions });

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const subscribedTo = subscriptions || ['general', 'gaming'];

    // Save to Supabase
    const supabase = getSupabase();
    let subscriberId = null;

    if (supabase) {
      console.log('[Game Register] Saving to Supabase...');
      
      // First check if subscriber exists
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .update({
            game_display_name: displayName || null,
            is_game_registered: true,
            subscribed_to: subscribedTo,
            updated_at: new Date().toISOString(),
          })
          .eq('email', normalizedEmail)
          .select('id')
          .single();

        if (error) {
          console.error('[Game Register] Supabase update error:', error);
        } else {
          subscriberId = data?.id;
          console.log('[Game Register] Updated subscriber:', subscriberId);
        }
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .insert({
            email: normalizedEmail,
            game_display_name: displayName || null,
            is_game_registered: true,
            subscribed_to: subscribedTo,
            source: source || 'game',
            status: 'active',
          })
          .select('id')
          .single();

        if (error) {
          console.error('[Game Register] Supabase insert error:', error);
        } else {
          subscriberId = data?.id;
          console.log('[Game Register] New subscriber:', subscriberId);
        }
      }
    } else {
      console.log('[Game Register] Supabase not configured');
    }

    // Send welcome email via Brevo
    if (isBrevoConfigured()) {
      console.log('[Game Register] Sending to Brevo...');
      const result = await subscribeToNewsletter(normalizedEmail, displayName, source || 'game');
      console.log('[Game Register] Brevo result:', result);
    }

    return NextResponse.json({
      success: true,
      subscriberId,
      message: 'Successfully registered!',
    });
  } catch (error) {
    console.error('[Game Register] Error:', error);
    return NextResponse.json(
      { error: 'Failed to register. Please try again.' },
      { status: 500 }
    );
  }
}
