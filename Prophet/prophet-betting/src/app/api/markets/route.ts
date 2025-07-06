import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface MarketListResponse {
  markets: Array<{
    id: string
    name: string
    description: string | null
    category: string | null
    type: string
    total_bets: number
    total_pool: number
    is_active: boolean
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
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'
    
    const offset = (page - 1) * limit
    
    // Build query
    let query = supabase
      .from('markets')
      .select(`
        id,
        name,
        description,
        category,
        type,
        is_active,
        created_at,
        bets!inner (
          id,
          total_pool
        )
      `, { count: 'exact' })
      .eq('is_active', true)
    
    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    // Apply sorting and pagination
    query = query
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)
    
    const { data: markets, error, count } = await query
    
    if (error) {
      console.error('Markets query error:', error)
      return NextResponse.json({
        error: 'Failed to fetch markets'
      }, { status: 500 })
    }
    
    // Transform data to include aggregated stats
    const transformedMarkets = markets?.map(market => ({
      id: market.id,
      name: market.name,
      description: market.description,
      category: market.category,
      type: market.type,
      total_bets: market.bets?.length || 0,
      total_pool: market.bets?.reduce((sum: number, bet: any) => sum + Number(bet.total_pool || 0), 0) || 0,
      is_active: market.is_active,
      created_at: market.created_at
    })) || []
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    const response: MarketListResponse = {
      markets: transformedMarkets,
      pagination: {
        total: count || 0,
        page,
        limit,
        total_pages: totalPages
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Markets API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData || !['admin', 'super_admin'].includes(userData.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to create markets' 
      }, { status: 403 })
    }
    
    const body = await request.json()
    const { name, description, category, type = 'binary' } = body
    
    // Validate required fields
    if (!name || !category) {
      return NextResponse.json({
        error: 'Missing required fields: name, category'
      }, { status: 400 })
    }
    
    // Validate type
    if (!['binary', 'multiple_choice', 'numeric'].includes(type)) {
      return NextResponse.json({
        error: 'Invalid market type. Must be binary, multiple_choice, or numeric'
      }, { status: 400 })
    }
    
    // Create market
    const { data: market, error } = await supabase
      .from('markets')
      .insert({
        name,
        description,
        category,
        type,
        created_by: user.id
      })
      .select()
      .single()
    
    if (error) {
      console.error('Create market error:', error)
      
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({
          error: 'A market with this name already exists'
        }, { status: 400 })
      }
      
      return NextResponse.json({
        error: 'Failed to create market'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      market
    })
    
  } catch (error) {
    console.error('Create market API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
