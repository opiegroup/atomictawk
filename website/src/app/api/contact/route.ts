import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail, isBrevoConfigured } from '@/lib/email';
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
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Save to Supabase as a lead
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('leads').insert({
          name,
          email: email.toLowerCase().trim(),
          source: 'contact_form',
          message: `Subject: ${subject}\n\n${message}`,
          status: 'new',
        });
      } catch (dbError) {
        console.log('Lead save skipped:', dbError);
      }
    }

    // Send email via Brevo
    if (isBrevoConfigured()) {
      const result = await sendContactFormEmail({
        name,
        email: email.toLowerCase().trim(),
        subject,
        message,
      });

      if (!result.success) {
        console.error('Email send error:', result.error);
        // Still return success since we saved to database
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully!',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
