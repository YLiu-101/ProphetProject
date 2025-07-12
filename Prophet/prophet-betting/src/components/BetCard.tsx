'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface BetCardProps {
  bet: {
    id: string
    title: string
    description?: string
    deadline: string
    creator?: {
      username?: string
      full_name?: string
    }
    participant_count?: number
    total_pool?: number
    resolved?: boolean
    outcome?: boolean | null
    yes_percentage?: number
  }
  index?: number
}

export default function BetCard({ bet, index = 0 }: BetCardProps) {
  const deadlineDate = new Date(bet.deadline)
  const isExpired = deadlineDate < new Date()
  const daysLeft = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60))
  
  // Mock probability for demo (in real app, calculate from bets)
  const yesPercentage = bet.yes_percentage || Math.floor(Math.random() * 80) + 10

  const getTimeLeft = () => {
    if (bet.resolved) {
      return new Date(bet.deadline).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
    if (hoursLeft < 24) return `${hoursLeft}h`
    if (daysLeft < 7) return `${daysLeft}d`
    return new Date(bet.deadline).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusBadge = () => {
    if (bet.resolved) return 'status-resolved'
    if (isExpired) return 'status-pending'
    return 'status-active'
  }

  const getStatusText = () => {
    if (bet.resolved) return 'Resolved'
    if (isExpired) return 'Pending'
    return 'Active'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/bet/${bet.id}`}>
        <div className="market-card h-full cursor-pointer">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold line-clamp-2 flex-1 pr-4" style={{ color: 'var(--text-primary)' }}>
              {bet.title}
            </h3>
            <span className={`status-badge ${getStatusBadge()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Probability Display */}
          {!bet.resolved && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-success">{yesPercentage}%</span>
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>YES</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-error">{100 - yesPercentage}%</span>
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>NO</span>
                  </div>
                </div>
              </div>
              
              {/* Probability bar */}
              <div className="probability-bar">
                <div 
                  className="probability-fill"
                  style={{ width: `${yesPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Resolved outcome */}
          {bet.resolved && bet.outcome !== null && (
            <div className="mb-6">
              <div className="flex items-center space-x-2">
                <span className={`text-3xl font-bold ${bet.outcome ? 'text-success' : 'text-error'}`}>
                  {bet.outcome ? 'YES' : 'NO'}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Final outcome</span>
              </div>
            </div>
          )}

          {/* Market stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {bet.total_pool?.toFixed(0) || 0}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Volume</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {bet.participant_count || 0}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Traders</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {getTimeLeft()}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {bet.resolved ? 'Ended' : 'Ends'}
              </div>
            </div>
          </div>

          {/* Action buttons (show on hover) */}
          {!bet.resolved && !isExpired && (
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // In real app, this would open a bet modal
                }}
                className="flex-1 btn btn-success py-2 text-sm"
              >
                Buy YES
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // In real app, this would open a bet modal
                }}
                className="flex-1 btn btn-error py-2 text-sm"
              >
                Buy NO
              </button>
            </div>
          )}

          {/* Creator info */}
          {bet.creator && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Created by{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {bet.creator.username || bet.creator.full_name || 'Anonymous'}
                </span>
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
