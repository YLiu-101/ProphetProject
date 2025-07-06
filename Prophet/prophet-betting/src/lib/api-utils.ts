import { createClient } from '@/lib/supabase/server'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Validation utilities
export const validators = {
  required: (value: any, fieldName: string): ValidationError | null => {
    if (value === undefined || value === null || value === '') {
      return { field: fieldName, message: `${fieldName} is required` }
    }
    return null
  },

  email: (value: string, fieldName: string): ValidationError | null => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { field: fieldName, message: `${fieldName} must be a valid email` }
    }
    return null
  },

  minLength: (value: string, min: number, fieldName: string): ValidationError | null => {
    if (value && value.length < min) {
      return { field: fieldName, message: `${fieldName} must be at least ${min} characters` }
    }
    return null
  },

  maxLength: (value: string, max: number, fieldName: string): ValidationError | null => {
    if (value && value.length > max) {
      return { field: fieldName, message: `${fieldName} must be no more than ${max} characters` }
    }
    return null
  },

  positiveNumber: (value: number, fieldName: string): ValidationError | null => {
    if (value !== undefined && (isNaN(value) || value <= 0)) {
      return { field: fieldName, message: `${fieldName} must be a positive number` }
    }
    return null
  },

  futureDate: (value: string, fieldName: string): ValidationError | null => {
    if (value) {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return { field: fieldName, message: `${fieldName} must be a valid date` }
      }
      if (date <= new Date()) {
        return { field: fieldName, message: `${fieldName} must be in the future` }
      }
    }
    return null
  },

  oneOf: (value: any, options: any[], fieldName: string): ValidationError | null => {
    if (value !== undefined && !options.includes(value)) {
      return { field: fieldName, message: `${fieldName} must be one of: ${options.join(', ')}` }
    }
    return null
  },

  boolean: (value: any, fieldName: string): ValidationError | null => {
    if (value !== undefined && typeof value !== 'boolean') {
      return { field: fieldName, message: `${fieldName} must be true or false` }
    }
    return null
  }
}

export function validateFields(data: any, rules: Record<string, ((value: any, fieldName: string) => ValidationError | null)[]>): ValidationResult {
  const errors: ValidationError[] = []
  
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = data[fieldName]
    for (const rule of fieldRules) {
      const error = rule(value, fieldName)
      if (error) {
        errors.push(error)
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Authentication utilities
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new APIError('Authentication required', 401)
  }
  
  return { user, supabase }
}

export async function requireRole(allowedRoles: string[]) {
  const { user, supabase } = await requireAuth()
  
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (error || !userData || !allowedRoles.includes(userData.role)) {
    throw new APIError('Insufficient permissions', 403)
  }
  
  return { user, supabase, userRole: userData.role }
}

// Database utilities
export async function checkBetExists(supabase: any, betId: string) {
  const { data: bet, error } = await supabase
    .from('bets')
    .select('id, resolved, deadline, creator_id, arbitrator_type, arbitrator_email')
    .eq('id', betId)
    .single()
  
  if (error || !bet) {
    throw new APIError('Bet not found', 404)
  }
  
  return bet
}

export async function checkUserBalance(supabase: any, userId: string, requiredAmount: number) {
  const { data: transactions, error } = await supabase
    .from('credit_transactions')
    .select('amount')
    .eq('user_id', userId)
  
  if (error) {
    throw new APIError('Failed to check user balance', 500)
  }
  
  const balance = transactions?.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0) || 0
  
  if (balance < requiredAmount) {
    throw new APIError('Insufficient credits', 400, 'INSUFFICIENT_CREDITS')
  }
  
  return balance
}

export async function checkUserCanPlaceBet(supabase: any, userId: string, betId: string) {
  // Check if user already participated
  const { data: existingParticipation } = await supabase
    .from('bet_participants')
    .select('id')
    .eq('bet_id', betId)
    .eq('user_id', userId)
    .single()
  
  if (existingParticipation) {
    throw new APIError('You have already placed a bet on this market', 400, 'ALREADY_PARTICIPATED')
  }
}

export async function checkUserCanResolveBet(supabase: any, userId: string, bet: any) {
  if (bet.resolved) {
    throw new APIError('Bet is already resolved', 400, 'ALREADY_RESOLVED')
  }
  
  if (new Date(bet.deadline) > new Date()) {
    throw new APIError('Cannot resolve bet before deadline', 400, 'DEADLINE_NOT_REACHED')
  }
  
  let authorized = false
  
  if (bet.arbitrator_type === 'creator' && bet.creator_id === userId) {
    authorized = true
  } else if (bet.arbitrator_type === 'friend') {
    // Check if user email matches arbitrator email
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email === bet.arbitrator_email) {
      authorized = true
    }
  } else if (bet.arbitrator_type === 'ai') {
    throw new APIError('AI bets must be resolved through the AI arbitrator system', 403, 'AI_RESOLUTION_REQUIRED')
  }
  
  if (!authorized) {
    throw new APIError('You are not authorized to resolve this bet', 403, 'UNAUTHORIZED_RESOLUTION')
  }
  
  return true
}

// Response utilities
export function createSuccessResponse(data: any, status: number = 200) {
  return Response.json({ success: true, ...data }, { status })
}

export function createErrorResponse(error: string, status: number = 500, code?: string) {
  return Response.json({ 
    error, 
    ...(code && { code }) 
  }, { status })
}

export function createValidationErrorResponse(errors: ValidationError[]) {
  return Response.json({
    error: 'Validation failed',
    validation_errors: errors
  }, { status: 400 })
}

// Async error handler wrapper
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error instanceof APIError) {
        throw error
      }
      
      // Handle Supabase errors
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as any
        
        switch (supabaseError.code) {
          case '23505': // Unique constraint violation
            throw new APIError('Resource already exists', 409, 'DUPLICATE_RESOURCE')
          case '23503': // Foreign key violation
            throw new APIError('Referenced resource not found', 400, 'INVALID_REFERENCE')
          case '42501': // Insufficient privilege
            throw new APIError('Access denied', 403, 'ACCESS_DENIED')
          default:
            throw new APIError('Database error', 500, 'DATABASE_ERROR')
        }
      }
      
      throw new APIError('Internal server error', 500)
    }
  }
}

// Rate limiting utilities (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const current = requestCounts.get(identifier)
  
  if (!current || current.resetTime <= windowStart) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

export function requireRateLimit(identifier: string, maxRequests?: number, windowMs?: number) {
  if (!checkRateLimit(identifier, maxRequests, windowMs)) {
    throw new APIError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED')
  }
}
