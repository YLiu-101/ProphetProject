import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check what tables exist
    const { data: tables, error } = await supabase
      .rpc('get_tables')
      .single()

    if (error) {
      // If RPC doesn't work, try a simple query to see if tables exist
      const { data: testBets, error: betsError } = await supabase
        .from('bets')
        .select('count')
        .limit(1)

      const { data: testUsers, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      return NextResponse.json({
        success: true,
        database_status: 'Testing individual tables',
        bets_table: betsError ? 'Error: ' + betsError.message : 'Exists',
        users_table: usersError ? 'Error: ' + usersError.message : 'Exists',
        user_id: user.id
      })
    }

    return NextResponse.json({
      success: true,
      tables: tables,
      user_id: user.id
    })

  } catch (error) {
    console.error('Test DB API error:', error)
    return NextResponse.json({ 
      error: 'Database connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
