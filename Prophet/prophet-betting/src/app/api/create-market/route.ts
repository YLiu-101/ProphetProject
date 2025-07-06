import { NextRequest } from 'next/server'
import { 
  requireAuth, 
  validateFields, 
  validators, 
  createSuccessResponse, 
  createErrorResponse,
  createValidationErrorResponse,
  withErrorHandling,
  APIError
} from '@/lib/api-utils'

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth()

  const body = await request.json()
  const { 
    title, 
    description, 
    deadline, 
    arbitrator_type, 
    arbitrator_email, 
    market_type = 'binary',
    stake_amount = 10 
  } = body

  // Validate input
  const validation = validateFields(body, {
    title: [
      validators.required,
      (value) => validators.minLength(value, 3, 'title'),
      (value) => validators.maxLength(value, 200, 'title')
    ],
    description: [
      validators.required,
      (value) => validators.minLength(value, 10, 'description'),
      (value) => validators.maxLength(value, 1000, 'description')
    ],
    deadline: [
      validators.required,
      validators.futureDate
    ],
    arbitrator_type: [
      validators.required,
      (value) => validators.oneOf(value, ['creator', 'friend', 'ai'], 'arbitrator_type')
    ],
    market_type: [
      (value) => validators.oneOf(value, ['binary', 'multiple_choice', 'numeric'], 'market_type')
    ],
    stake_amount: [
      validators.required,
      validators.positiveNumber
    ]
  })

  if (!validation.isValid) {
    return createValidationErrorResponse(validation.errors)
  }

  // Additional validation for arbitrator email
  if (arbitrator_type === 'friend') {
    const emailValidation = validators.email(arbitrator_email, 'arbitrator_email')
    if (!arbitrator_email || emailValidation) {
      return createErrorResponse('Arbitrator email is required for friend arbitration', 400)
    }
  }

  // Start transaction
  const { data, error } = await supabase.rpc('create_market_with_bet', {
    p_title: title,
    p_description: description,
    p_deadline: deadline,
    p_arbitrator_type: arbitrator_type,
    p_arbitrator_email: arbitrator_email,
    p_market_type: market_type,
    p_creator_id: user.id,
    p_stake_amount: stake_amount
  })

  if (error) {
    console.error('Create market error:', error)
    throw new APIError(error.message || 'Failed to create market', 500)
  }

  return createSuccessResponse({ 
    bet_id: data?.bet_id,
    market_id: data?.market_id 
  })
})
