import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bet_id, outcome, reasoning } = body

    // Validate required fields
    if (!bet_id || outcome === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: bet_id, outcome' 
      }, { status: 400 })
    }

    // Validate outcome is boolean
    if (typeof outcome !== 'boolean') {
      return NextResponse.json({ 
        error: 'Outcome must be true (yes) or false (no)' 
      }, { status: 400 })
    }

    // Check if bet exists and user is authorized to resolve it
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .select(`
        id, 
        creator_id, 
        arbitrator_type, 
        arbitrator_email, 
        resolved,
        deadline
      `)
      .eq('id', bet_id)
      .single()

    if (betError || !bet) {
      return NextResponse.json({ 
        error: 'Bet not found' 
      }, { status: 404 })
    }

    if (bet.resolved) {
      return NextResponse.json({ 
        error: 'Bet is already resolved' 
      }, { status: 400 })
    }

    // Check authorization based on arbitrator type
    let authorized = false
    
    if (bet.arbitrator_type === 'creator' && bet.creator_id === user.id) {
      authorized = true
    } else if (bet.arbitrator_type === 'friend') {
      // For friend arbitrators, check if user email matches arbitrator_email
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user?.email === bet.arbitrator_email) {
        authorized = true
      }
    } else if (bet.arbitrator_type === 'ai') {
      // Only system/admin can manually resolve AI bets, or it should be done via AI endpoint
      return NextResponse.json({ 
        error: 'AI bets must be resolved through the AI arbitrator system' 
      }, { status: 403 })
    }

    if (!authorized) {
      return NextResponse.json({ 
        error: 'You are not authorized to resolve this bet' 
      }, { status: 403 })
    }

    // Check if deadline has passed (required for resolution)
    if (new Date(bet.deadline) > new Date()) {
      return NextResponse.json({ 
        error: 'Cannot resolve bet before deadline' 
      }, { status: 400 })
    }

    // Use RPC function to resolve bet (handles payout calculation and distribution)
    const { data, error } = await supabase.rpc('resolve_bet', {
      p_bet_id: bet_id,
      p_outcome: outcome,
      p_arbitrator_id: user.id,
      p_reasoning: reasoning || null
    })

    if (error) {
      console.error('Resolve bet error:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to resolve bet' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      decision_id: data?.decision_id,
      total_payout: data?.total_payout,
      winners_count: data?.winners_count
    })

  } catch (error) {
    console.error('Resolve bet API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
