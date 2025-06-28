import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/feed'
  
  // Log the parameters for debugging
  console.log('Auth confirm params:', { token_hash, type, searchParams: Object.fromEntries(searchParams) })

  if (token_hash && type) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as 'signup' | 'recovery' | 'email_change' | 'email',
        token_hash,
      })

      console.log('Verify OTP result:', { data, error })

      if (!error && data?.user) {
        // redirect user to specified redirect URL or root of app
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (err) {
      console.error('Verify OTP error:', err)
    }
  }

  // Also try the old token parameter format (some versions of Supabase use this)
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  if (token) {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token,
        type: 'signup',
        email: email || '',
      })

      console.log('Verify OTP with token result:', { data, error })

      if (!error && data?.user) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (err) {
      console.error('Verify OTP with token error:', err)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
