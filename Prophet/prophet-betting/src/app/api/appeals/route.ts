import { NextRequest } from 'next/server'
import { 
  requireAuth, 
  validateFields, 
  validators, 
  createSuccessResponse, 
  createValidationErrorResponse,
  withErrorHandling,
  APIError,
  checkBetExists
} from '@/lib/api-utils'

// GET /api/appeals - List user's appeals
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth()
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
  const status = searchParams.get('status') || 'all'
  
  const offset = (page - 1) * limit
  
  // Build query
  let query = supabase
    .from('appeals')
    .select(`
      *,
      bet:bets(id, title, resolved, outcome),
      user:users(id, username, full_name)
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  // Apply status filter
  if (status !== 'all') {
    query = query.eq('status', status)
  }
  
  const { data: appeals, error, count } = await query
  
  if (error) {
    console.error('Failed to fetch appeals:', error)
    throw new APIError('Failed to fetch appeals', 500)
  }
  
  return createSuccessResponse({
    appeals,
    pagination: {
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    }
  })
})

// POST /api/appeals - Create new appeal
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth()
  
  const body = await request.json()
  const { bet_id, reason } = body
  
  // Validate input
  const validation = validateFields(body, {
    bet_id: [validators.required],
    reason: [
      validators.required,
      (value: string, fieldName: string) => validators.minLength(value, 20, fieldName),
      (value: string, fieldName: string) => validators.maxLength(value, 1000, fieldName)
    ]
  })
  
  if (!validation.isValid) {
    return createValidationErrorResponse(validation.errors)
  }
  
  // Check if bet exists and is resolved
  const bet = await checkBetExists(supabase, bet_id)
  
  if (!bet.resolved) {
    throw new APIError('Cannot appeal a bet that has not been resolved yet', 400, 'BET_NOT_RESOLVED')
  }
  
  // Check if bet was AI arbitrated
  if (bet.arbitrator_type !== 'ai') {
    throw new APIError('Only AI-arbitrated bets can be appealed', 400, 'NOT_AI_ARBITRATED')
  }
  
  // Check if user participated in the bet
  const { data: participation } = await supabase
    .from('bet_participants')
    .select('id')
    .eq('bet_id', bet_id)
    .eq('user_id', user.id)
    .single()
  
  if (!participation) {
    throw new APIError('You did not participate in this bet', 403, 'NOT_PARTICIPANT')
  }
  
  // Check if user already appealed this bet
  const { data: existingAppeal } = await supabase
    .from('appeals')
    .select('id')
    .eq('bet_id', bet_id)
    .eq('user_id', user.id)
    .single()
  
  if (existingAppeal) {
    throw new APIError('You have already appealed this bet', 400, 'ALREADY_APPEALED')
  }
  
  // Check if appeal is within time limit (7 days after resolution)
  const resolutionDate = new Date(bet.resolved_at)
  const appealDeadline = new Date(resolutionDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  if (new Date() > appealDeadline) {
    throw new APIError('Appeal deadline has passed (7 days after resolution)', 400, 'DEADLINE_PASSED')
  }
  
  // Create the appeal
  const { data: appeal, error } = await supabase
    .from('appeals')
    .insert({
      bet_id,
      user_id: user.id,
      reason,
      status: 'pending'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Failed to create appeal:', error)
    throw new APIError('Failed to create appeal', 500)
  }
  
  // TODO: Send notification to admins about new appeal
  
  return createSuccessResponse({ appeal }, 201)
})
