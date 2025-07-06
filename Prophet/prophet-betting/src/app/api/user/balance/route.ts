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

    // Get current balance
    const { data: transactions, error: balanceError } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', user.id)

    if (balanceError) {
      console.error('Balance query error:', balanceError)
      return NextResponse.json({ 
        error: 'Failed to fetch balance' 
      }, { status: 500 })
    }

    const currentBalance = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0

    // Get recent transactions
    const { data: recentTransactions, error: txError } = await supabase
      .from('credit_transactions')
      .select(`
        id,
        amount,
        transaction_type,
        description,
        created_at,
        bet_id
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (txError) {
      console.error('Transactions query error:', txError)
      return NextResponse.json({ 
        error: 'Failed to fetch transactions' 
      }, { status: 500 })
    }

    // Get user's active bets
    const { data: activeBets, error: betsError } = await supabase
      .from('bet_participants')
      .select(`
        id,
        prediction,
        stake_amount,
        created_at,
        bets!inner (
          id,
          title,
          deadline,
          resolved
        )
      `)
      .eq('user_id', user.id)
      .eq('bets.resolved', false)

    if (betsError) {
      console.error('Active bets query error:', betsError)
      return NextResponse.json({ 
        error: 'Failed to fetch active bets' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      balance: currentBalance,
      recent_transactions: recentTransactions || [],
      active_bets: activeBets || [],
      stats: {
        total_transactions: transactions?.length || 0,
        active_bets_count: activeBets?.length || 0
      }
    })

  } catch (error) {
    console.error('Balance API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
