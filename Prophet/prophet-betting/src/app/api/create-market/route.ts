import { NextRequest } from 'next/server'
import { 
  requireAuth, 
  validateFields, 
  validators, 
  createSuccessResponse, 
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
    stake_amount
  } = body

  // Build validation rules with proper validator functions
  const validationRules: Record<string, ((value: any, fieldName: string) => any)[]> = {
    title: [
      validators.required,
      (value: string, fieldName: string) => validators.minLength(value, 3, fieldName),
      (value: string, fieldName: string) => validators.maxLength(value, 200, fieldName)
    ],
    description: [
      validators.required,
      (value: string, fieldName: string) => validators.minLength(value, 10, fieldName),
      (value: string, fieldName: string) => validators.maxLength(value, 1000, fieldName)
    ],
    deadline: [validators.required, validators.futureDate],
    arbitrator_type: [
      validators.required,
      (value: any, fieldName: string) => validators.oneOf(value, ['creator', 'friend', 'ai'], fieldName)
    ],
    stake_amount: [validators.required, validators.positiveNumber]
  }

  // Add arbitrator_email validation if type is 'friend'
  if (arbitrator_type === 'friend') {
    validationRules.arbitrator_email = [validators.required, validators.email]
  }

  // Validate input
  const validation = validateFields(body, validationRules)

  if (!validation.isValid) {
    return createValidationErrorResponse(validation.errors)
  }

  // Use RPC function to create market and bet atomically
  const { data, error } = await supabase.rpc('create_market_with_bet', {
    p_title: title,
    p_description: description,
    p_deadline: deadline,
    p_arbitrator_type: arbitrator_type,
    p_arbitrator_email: arbitrator_type === 'friend' ? arbitrator_email : null,
    p_market_type: market_type,
    p_creator_id: user.id,
    p_stake_amount: stake_amount
  })

  if (error) {
    console.error('Create market RPC error:', error)
    throw new APIError(error.message || 'Failed to create market and bet', 500)
  }

  return createSuccessResponse({ 
    bet_id: data?.bet_id,
    market_id: data?.market_id
  })
})
