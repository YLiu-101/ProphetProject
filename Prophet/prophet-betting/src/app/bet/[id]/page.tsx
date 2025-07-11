'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useBalance } from '@/hooks/useBalance'

interface Bet {
  id: string
  title: string
  description: string | null
  creator_id: string
  arbitrator_type: 'friend' | 'ai'
  arbitrator_id: string | null
  deadline: string
  minimum_stake: number
  outcome: string | null
  resolved_at: string | null
  created_at: string
  creator_username: string | null
}

interface Participant {
  id: string
  user_id: string
  prediction: string
  stake_amount: number
  joined_at: string
  username: string | null
}

export default function BetDetailPage() {
  const [bet, setBet] = useState<Bet | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joinLoading, setJoinLoading] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [joinForm, setJoinForm] = useState({
    prediction: '',
    stakeAmount: ''
  })
  
  const { balance, refetch: refetchBalance } = useBalance()
  const router = useRouter()
  const params = useParams()
  const betId = params?.id as string
  const supabase = createClient()

  useEffect(() => {
    const fetchBetDetails = async () => {
      try {
        setLoading(true)
        
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const response = await fetch(`/api/bets/${betId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch bet details')
        }
        
        const data = await response.json()
        setBet(data.bet)
        setParticipants(data.participants || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bet details')
      } finally {
        setLoading(false)
      }
    }

    if (betId) {
      fetchBetDetails()
    }
  }, [betId, router, supabase.auth])

  const refetchBetDetails = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/bets/${betId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bet details')
      }
      
      const data = await response.json()
      setBet(data.bet)
      setParticipants(data.participants || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bet details')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinBet = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoinLoading(true)
    setError(null)

    try {
      if (!joinForm.prediction.trim()) {
        throw new Error('Prediction is required')
      }
      if (!joinForm.stakeAmount || parseFloat(joinForm.stakeAmount) <= 0) {
        throw new Error('Valid stake amount is required')
      }
      if (bet && parseFloat(joinForm.stakeAmount) < bet.minimum_stake) {
        throw new Error(`Stake must be at least $${bet.minimum_stake}`)
      }
      if (balance !== null && parseFloat(joinForm.stakeAmount) > balance) {
        throw new Error('Insufficient balance')
      }

      const payload = {
        bet_id: betId,
        prediction: joinForm.prediction.trim(),
        stake_amount: parseFloat(joinForm.stakeAmount)
      }

      const response = await fetch('/api/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join bet')
      }

      // Refresh bet details and balance
      await refetchBetDetails()
      await refetchBalance()
      
      // Reset form and hide it
      setJoinForm({ prediction: '', stakeAmount: '' })
      setShowJoinForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join bet')
    } finally {
      setJoinLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusBadge = () => {
    if (!bet) return null
    
    if (bet.resolved_at) {
      return <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">Resolved</span>
    }
    
    const deadline = new Date(bet.deadline)
    const now = new Date()
    
    if (deadline < now) {
      return <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">Expired</span>
    }
    
    return <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">Active</span>
  }

  const isDeadlinePassed = () => {
    return bet && new Date(bet.deadline) < new Date()
  }

  const canJoinBet = () => {
    return bet && !bet.resolved_at && !isDeadlinePassed()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading bet details...</div>
        </div>
      </div>
    )
  }

  if (error && !bet) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-800 mb-4">{error}</div>
            <button 
              onClick={() => router.push('/feed')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Back to Feed
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!bet) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/feed')}
          className="mb-6 text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          ← Back to Feed
        </button>

        {/* Bet Details */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{bet.title}</h1>
              {bet.description && (
                <p className="text-gray-600 text-lg mb-4">{bet.description}</p>
              )}
            </div>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <div className="text-sm text-gray-500">Creator</div>
              <div className="text-lg font-medium">{bet.creator_username || 'Anonymous'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Minimum Stake</div>
              <div className="text-lg font-medium">${bet.minimum_stake}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Deadline</div>
              <div className="text-lg font-medium">{formatDate(bet.deadline)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Arbitrator</div>
              <div className="text-lg font-medium">
                {bet.arbitrator_type === 'ai' ? 'AI Agent' : 'Friend/Manual'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Participants</div>
              <div className="text-lg font-medium">{participants.length}</div>
            </div>
            {bet.outcome && (
              <div>
                <div className="text-sm text-gray-500">Outcome</div>
                <div className="text-lg font-medium text-green-600">{bet.outcome}</div>
              </div>
            )}
          </div>

          {/* Join Bet Section */}
          {canJoinBet() && (
            <div className="border-t pt-6">
              {!showJoinForm ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowJoinForm(true)}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium text-lg"
                  >
                    Join This Bet
                  </button>
                  {balance !== null && (
                    <p className="mt-2 text-sm text-gray-600">Your balance: ${balance}</p>
                  )}
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-4">Join This Bet</h3>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="text-red-800 text-sm">{error}</div>
                    </div>
                  )}
                  <form onSubmit={handleJoinBet} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Prediction
                      </label>
                      <input
                        type="text"
                        value={joinForm.prediction}
                        onChange={(e) => setJoinForm(prev => ({ ...prev, prediction: e.target.value }))}
                        placeholder="Yes/No or your prediction..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stake Amount ($)
                      </label>
                      <input
                        type="number"
                        value={joinForm.stakeAmount}
                        onChange={(e) => setJoinForm(prev => ({ ...prev, stakeAmount: e.target.value }))}
                        placeholder={bet.minimum_stake.toString()}
                        min={bet.minimum_stake}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={joinLoading}
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {joinLoading ? 'Joining...' : 'Join Bet'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowJoinForm(false)
                          setError(null)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {isDeadlinePassed() && !bet.resolved_at && (
            <div className="border-t pt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-yellow-800">This bet has passed its deadline and is awaiting resolution.</div>
              </div>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Participants ({participants.length})</h2>
          
          {participants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No participants yet. Be the first to join!
            </div>
          ) : (
            <div className="space-y-4">
              {participants.map((participant) => (
                <div key={participant.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{participant.username || 'Anonymous'}</div>
                    <div className="text-sm text-gray-600">Prediction: {participant.prediction}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${participant.stake_amount}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(participant.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
