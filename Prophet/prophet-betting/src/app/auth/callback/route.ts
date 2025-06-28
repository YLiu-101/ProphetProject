import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/feed'

  console.log('Auth callback params:', { 
    code: code ? 'present' : 'missing', 
    error, 
    error_description,
    allParams: Object.fromEntries(searchParams) 
  })

  // Handle errors first
  if (error) {
    console.log('Auth callback error:', error, error_description)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  if (code) {
    const supabase = await createClient()
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Exchange code result:', { 
        user: data?.user?.id ? 'present' : 'missing', 
        session: data?.session ? 'present' : 'missing',
        error: error?.message 
      })

      if (!error && data?.session) {
        const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === 'development'
        if (isLocalEnv) {
          // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    } catch (err) {
      console.error('Exchange code error:', err)
    }
  }

  // return the user to an error page with instructions
  console.log('Redirecting to auth error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
