import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface BetsListResponse {
  bets: Array<{
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
    resolved: boolean
    outcome: boolean | null
    participant_count: number
    total_pool: number
    user_participation: {
      prediction: boolean
      stake_amount: number
    } | null
    created_at: string
  }>
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const status = searchParams.get('status') // 'active', 'resolved', 'all'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const creator_id = searchParams.get('creator_id')
    const arbitrator_type = searchParams.get('arbitrator_type')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
    
    const offset = (page - 1) * limit
    
    // Get current user for participation info
    const { data: { user } } = await supabase.auth.getUser()
    
    // Build base query
    let query = supabase
      .from('bets')
      .select(`
        id,
        title,
        description,
        creator_id,
        deadline,
        arbitrator_type,
        resolved,
        outcome,
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
        ),
        bet_participants (
          user_id,
          prediction,
          stake_amount
        )
      `, { count: 'exact' })
    
    // Apply filters
    if (status === 'active') {
      query = query.eq('resolved', false).gte('deadline', new Date().toISOString())
    } else if (status === 'resolved') {
      query = query.eq('resolved', true)
    } else if (status === 'expired') {
      query = query.eq('resolved', false).lt('deadline', new Date().toISOString())
    }
    
    if (category) {
      query = query.eq('markets.category', category)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (creator_id) {
      query = query.eq('creator_id', creator_id)
    }
    
    if (arbitrator_type && ['creator', 'friend', 'ai'].includes(arbitrator_type)) {
      query = query.eq('arbitrator_type', arbitrator_type)
    }
    
    // Apply sorting and pagination
    query = query
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)
    
    const { data: bets, error, count } = await query
    
    if (error) {
      console.error('Bets query error:', error)
      return NextResponse.json({
        error: 'Failed to fetch bets'
      }, { status: 500 })
    }
    
    // Transform data
    const transformedBets = bets?.map(bet => {
      const participants = bet.bet_participants || []
      const userParticipation = user 
        ? participants.find((p: { user_id: string; prediction: boolean; stake_amount: number }) => p.user_id === user.id)
        : null
      
      const creator = Array.isArray(bet.users) ? bet.users[0] : bet.users
      const market = Array.isArray(bet.markets) ? bet.markets[0] : bet.markets
      
      return {
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
        resolved: bet.resolved,
        outcome: bet.outcome,
        participant_count: participants.length,
        total_pool: Number(bet.total_pool || 0),
        user_participation: userParticipation ? {
          prediction: userParticipation.prediction,
          stake_amount: Number(userParticipation.stake_amount)
        } : null,
        created_at: bet.created_at
      }
    }) || []
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    const response: BetsListResponse = {
      bets: transformedBets,
      pagination: {
        total: count || 0,
        page,
        limit,
        total_pages: totalPages
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Bets API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
