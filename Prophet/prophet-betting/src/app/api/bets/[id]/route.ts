import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface BetDetailResponse {
  bet: {
    id: string
    title: string
    description: string | null
    creator: {
      id: string
      username: string | null
      full_name: string | null
    }
    market: {
      id: string
      name: string
      category: string | null
    } | null
    deadline: string
    arbitrator_type: string
    arbitrator_email: string | null
    minimum_stake: number
    resolved: boolean
    outcome: boolean | null
    resolved_at: string | null
    total_pool: number
    created_at: string
  }
  participants: Array<{
    id: string
    user: {
      id: string
      username: string | null
      full_name: string | null
    }
    prediction: boolean
    stake_amount: number
    created_at: string
  }>
  decision: {
    id: string
    arbitrator: {
      id: string
      username: string | null
      full_name: string | null
    } | null
    outcome: boolean
    reasoning: string | null
    is_ai_decision: boolean
    decided_at: string
  } | null
  user_participation: {
    prediction: boolean
    stake_amount: number
  } | null
  stats: {
    total_participants: number
    yes_count: number
    no_count: number
    yes_amount: number
    no_amount: number
    potential_payout_yes: number
    potential_payout_no: number
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const bet_id = params.id
    
    if (!bet_id) {
      return NextResponse.json({
        error: 'Bet ID is required'
      }, { status: 400 })
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get bet details
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .select(`
        id,
        title,
        description,
        creator_id,
        deadline,
        arbitrator_type,
        arbitrator_email,
        minimum_stake,
        resolved,
        outcome,
        resolved_at,
        total_pool,
        created_at,
        users!creator_id (
          id,
          username,
          full_name
        ),
        markets (
          id,
          name,
          category
        )
      `)
      .eq('id', bet_id)
      .single()
    
    if (betError || !bet) {
      return NextResponse.json({
        error: 'Bet not found'
      }, { status: 404 })
    }
    
    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('bet_participants')
      .select(`
        id,
        user_id,
        prediction,
        stake_amount,
        created_at,
        users (
          id,
          username,
          full_name
        )
      `)
      .eq('bet_id', bet_id)
      .order('created_at', { ascending: false })
    
    if (participantsError) {
      console.error('Participants query error:', participantsError)
      return NextResponse.json({
        error: 'Failed to fetch participants'
      }, { status: 500 })
    }
    
    // Get arbitrator decision if resolved
    let decision = null
    if (bet.resolved) {
      const { data: decisionData, error: decisionError } = await supabase
        .from('arbitrator_decisions')
        .select(`
          id,
          arbitrator_id,
          outcome,
          reasoning,
          is_ai_decision,
          decided_at,
          users (
            id,
            username,
            full_name
          )
        `)
        .eq('bet_id', bet_id)
        .single()
      
      if (!decisionError && decisionData) {
        const arbitrator = Array.isArray(decisionData.users) ? decisionData.users[0] : decisionData.users
        decision = {
          id: decisionData.id,
          arbitrator: arbitrator ? {
            id: arbitrator.id,
            username: arbitrator.username,
            full_name: arbitrator.full_name
          } : null,
          outcome: decisionData.outcome,
          reasoning: decisionData.reasoning,
          is_ai_decision: decisionData.is_ai_decision,
          decided_at: decisionData.decided_at
        }
      }
    }
    
    // Calculate statistics
    const yesParticipants = participants?.filter(p => p.prediction === true) || []
    const noParticipants = participants?.filter(p => p.prediction === false) || []
    
    const yesAmount = yesParticipants.reduce((sum, p) => sum + Number(p.stake_amount), 0)
    const noAmount = noParticipants.reduce((sum, p) => sum + Number(p.stake_amount), 0)
    const totalAmount = yesAmount + noAmount
    
    // Calculate potential payouts (simplified winner-takes-all with proportional distribution)
    const potentialPayoutYes = yesAmount > 0 ? (totalAmount / yesAmount) : 1
    const potentialPayoutNo = noAmount > 0 ? (totalAmount / noAmount) : 1
    
    // Get user participation
    const userParticipation = user && participants
      ? participants.find(p => p.user_id === user.id)
      : null
    
    // Transform data
    const creator = Array.isArray(bet.users) ? bet.users[0] : bet.users
    const market = Array.isArray(bet.markets) ? bet.markets[0] : bet.markets
    
    const response: BetDetailResponse = {
      bet: {
        id: bet.id,
        title: bet.title,
        description: bet.description,
        creator: {
          id: bet.creator_id,
          username: creator?.username || null,
          full_name: creator?.full_name || null
        },
        market: market ? {
          id: market.id,
          name: market.name,
          category: market.category
        } : null,
        deadline: bet.deadline,
        arbitrator_type: bet.arbitrator_type,
        arbitrator_email: bet.arbitrator_email,
        minimum_stake: Number(bet.minimum_stake || 0),
        resolved: bet.resolved,
        outcome: bet.outcome,
        resolved_at: bet.resolved_at,
        total_pool: Number(bet.total_pool || 0),
        created_at: bet.created_at
      },
      participants: participants?.map(p => {
        const participantUser = Array.isArray(p.users) ? p.users[0] : p.users
        return {
          id: p.id,
          user: {
            id: p.user_id,
            username: participantUser?.username || null,
            full_name: participantUser?.full_name || null
          },
          prediction: p.prediction,
          stake_amount: Number(p.stake_amount),
          created_at: p.created_at
        }
      }) || [],
      decision,
      user_participation: userParticipation ? {
        prediction: userParticipation.prediction,
        stake_amount: Number(userParticipation.stake_amount)
      } : null,
      stats: {
        total_participants: participants?.length || 0,
        yes_count: yesParticipants.length,
        no_count: noParticipants.length,
        yes_amount: yesAmount,
        no_amount: noAmount,
        potential_payout_yes: potentialPayoutYes,
        potential_payout_no: potentialPayoutNo
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Bet detail API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
