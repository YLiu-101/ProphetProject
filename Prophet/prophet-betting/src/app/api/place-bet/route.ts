import { NextRequest } from 'next/server'
import { 
  requireAuth, 
  validateFields, 
  validators, 
  createSuccessResponse, 
  createErrorResponse,
  createValidationErrorResponse,
  withErrorHandling,
  checkBetExists,
  checkUserCanPlaceBet,
  APIError
} from '@/lib/api-utils'

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth()

  const body = await request.json()
  const { bet_id, prediction, stake_amount } = body

  // Validate input
  const validation = validateFields(body, {
    bet_id: [validators.required],
    prediction: [validators.required, validators.boolean],
    stake_amount: [validators.required, validators.positiveNumber]
  })

  if (!validation.isValid) {
    return createValidationErrorResponse(validation.errors)
  }

  // Check if bet exists and is still open
  const bet = await checkBetExists(supabase, bet_id)
  
  if (bet.resolved) {
    throw new APIError('Bet is already resolved', 400, 'BET_RESOLVED')
  }

  if (new Date(bet.deadline) <= new Date()) {
    throw new APIError('Bet deadline has passed', 400, 'DEADLINE_PASSED')
  }

  // Check if user can place bet (not already participated)
  await checkUserCanPlaceBet(supabase, user.id, bet_id)

  // Use RPC function to place bet (handles credit verification and transaction)
  const { data, error } = await supabase.rpc('place_bet', {
    p_bet_id: bet_id,
    p_user_id: user.id,
    p_prediction: prediction,
    p_stake_amount: stake_amount
  })

  if (error) {
    console.error('Place bet error:', error)
    
    // Handle specific error cases
    if (error.message.includes('insufficient_credits')) {
      throw new APIError('Insufficient credits to place this bet', 400, 'INSUFFICIENT_CREDITS')
    }
    
    throw new APIError(error.message || 'Failed to place bet', 500)
  }

  return createSuccessResponse({ 
    participant_id: data?.participant_id,
    new_balance: data?.new_balance
  })
})
