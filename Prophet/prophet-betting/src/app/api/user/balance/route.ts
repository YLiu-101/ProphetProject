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

    // First, check if credit_transactions table exists and has data
    const { data: transactions, error: balanceError } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', user.id)

    if (balanceError) {
      console.error('Balance query error:', balanceError)
      // If table doesn't exist or other error, return default balance
      return NextResponse.json({ 
        success: true,
        balance: 100, // Default starting balance
        recent_transactions: [],
        active_bets: [],
        stats: {
          total_transactions: 0,
          active_bets_count: 0
        }
      })
    }

    const currentBalance = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 100

    // Get recent transactions (simplified)
    const { data: recentTransactions } = await supabase
      .from('credit_transactions')
      .select(`
        id,
        amount,
        type,
        description,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      balance: currentBalance,
      recent_transactions: recentTransactions || [],
      active_bets: [],
      stats: {
        total_transactions: transactions?.length || 0,
        active_bets_count: 0
      }
    })

  } catch (error) {
    console.error('Balance API error:', error)
    // Return default response on any error
    return NextResponse.json({ 
      success: true,
      balance: 100,
      recent_transactions: [],
      active_bets: [],
      stats: {
        total_transactions: 0,
        active_bets_count: 0
      }
    })
  }
}
