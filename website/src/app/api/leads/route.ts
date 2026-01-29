import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, source, message } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Use the anon client to call the RPC
    const supabase = await createClient()
    
    const { data, error } = await (supabase.rpc as any)('create_lead_from_public_form', {
      p_name: name || null,
      p_email: email,
      p_phone: phone || null,
      p_source: source || 'contact_form',
      p_message: message || null
    })

    if (error) {
      console.error('Lead creation error:', error)
      return NextResponse.json(
        { error: 'Failed to submit enquiry' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      id: data 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
