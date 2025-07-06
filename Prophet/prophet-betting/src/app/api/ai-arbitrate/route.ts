import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // This endpoint can be called by system/cron jobs or authorized users
    const body = await request.json()
    const { bet_id } = body

    if (!bet_id) {
      return NextResponse.json({ 
        error: 'Missing required field: bet_id' 
      }, { status: 400 })
    }

    // Get bet details
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .select(`
        id,
        title,
        description,
        deadline,
        arbitrator_type,
        resolved
      `)
      .eq('id', bet_id)
      .single()

    if (betError || !bet) {
      return NextResponse.json({ 
        error: 'Bet not found' 
      }, { status: 404 })
    }

    if (bet.resolved) {
      return NextResponse.json({ 
        error: 'Bet is already resolved' 
      }, { status: 400 })
    }

    if (bet.arbitrator_type !== 'ai') {
      return NextResponse.json({ 
        error: 'This bet is not set up for AI arbitration' 
      }, { status: 400 })
    }

    // Check if deadline has passed
    if (new Date(bet.deadline) > new Date()) {
      return NextResponse.json({ 
        error: 'Cannot resolve bet before deadline' 
      }, { status: 400 })
    }

    let aiDecision: boolean
    let reasoning: string

    // For now, make a simple decision (can be enhanced with real AI logic)
    if (process.env.NODE_ENV === 'development') {
      // Development: Random decision for testing
      aiDecision = Math.random() > 0.5
      reasoning = `AI Decision (Development Mode): Randomly determined outcome. This is a placeholder for actual AI arbitration logic.`
    } else {
      // Production: Use OpenAI to make decision
      try {
        const prompt = `
You are an AI arbitrator for a betting platform. You need to determine if the following bet should resolve as TRUE (yes) or FALSE (no).

Bet Title: ${bet.title}
Bet Description: ${bet.description}
Deadline: ${bet.deadline}

Based on publicly available information and the description provided, determine if this bet should resolve as TRUE or FALSE. 

Provide your decision as a JSON object with:
{
  "decision": true/false,
  "reasoning": "Brief explanation of your decision"
}

Be objective and base your decision on verifiable facts when possible.
`

        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        })

        const aiResponse = JSON.parse(response.choices[0].message.content || '{"decision": false, "reasoning": "Unable to determine"}')
        aiDecision = aiResponse.decision
        reasoning = aiResponse.reasoning

      } catch (aiError) {
        console.error('OpenAI API error:', aiError)
        // Fallback to random for now
        aiDecision = Math.random() > 0.5
        reasoning = "AI arbitration failed, random decision made as fallback"
      }
    }

    // Create AI user for system decisions if it doesn't exist
    const aiUserId = '00000000-0000-0000-0000-000000000000' // System AI user ID

    // Resolve the bet using our RPC function
    const { data, error } = await supabase.rpc('resolve_bet', {
      p_bet_id: bet_id,
      p_outcome: aiDecision,
      p_arbitrator_id: aiUserId,
      p_reasoning: reasoning
    })

    if (error) {
      console.error('AI resolve bet error:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to resolve bet' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      ai_decision: aiDecision,
      reasoning: reasoning,
      decision_id: data?.decision_id,
      total_payout: data?.total_payout,
      winners_count: data?.winners_count
    })

  } catch (error) {
    console.error('AI arbitrate API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
