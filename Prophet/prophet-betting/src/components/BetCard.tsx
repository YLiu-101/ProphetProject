'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/bet/${bet.id}`}>
        <div className={cn(
          "market-card rounded-xl p-5 h-full",
          "transition-all duration-300",
          "relative overflow-hidden"
        )}>
          {/* Market status badge */}
          <div className="absolute top-3 right-3">
            {bet.resolved ? (
              <span className="badge-resolved">Resolved</span>
            ) : isExpired ? (
              <span className="badge-market bg-orange-500/10 border-orange-500/30 text-orange-500">
                Pending
              </span>
            ) : (
              <span className="badge-active">Active</span>
            )}
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Title */}
            <h3 className="text-base font-semibold text-gray-100 mb-3 line-clamp-2 pr-20">
              {bet.title}
            </h3>

            {/* Probability Display */}
            {!bet.resolved && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-market-green">{yesPercentage}%</span>
                      <span className="text-xs text-gray-500">YES</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-market-red">{100 - yesPercentage}%</span>
                      <span className="text-xs text-gray-500">NO</span>
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
              <div className="mb-4">
                <div className={cn(
                  "text-2xl font-bold",
                  bet.outcome ? "text-market-green" : "text-market-red"
                )}>
                  {bet.outcome ? "YES" : "NO"}
                </div>
                <span className="text-xs text-gray-500">Final outcome</span>
              </div>
            )}

            {/* Market stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="stat-card">
                <div className="text-xs text-gray-500 mb-1">Volume</div>
                <div className="text-sm font-semibold text-gray-200">
                  {bet.total_pool?.toFixed(0) || 0}
                </div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-gray-500 mb-1">Traders</div>
                <div className="text-sm font-semibold text-gray-200">
                  {bet.participant_count || 0}
                </div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-gray-500 mb-1">
                  {bet.resolved ? 'Ended' : 'Ends in'}
                </div>
                <div className="text-sm font-semibold text-gray-200">
                  {bet.resolved ? (
                    new Date(bet.deadline).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  ) : hoursLeft < 48 ? (
                    `${hoursLeft}h`
                  ) : (
                    `${daysLeft}d`
                  )}
                </div>
              </div>
            </div>

            {/* Quick bet buttons (show on hover) */}
            {!bet.resolved && !isExpired && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    // In real app, this would open a bet modal
                  }}
                  className="flex-1 py-2 px-3 rounded-lg btn-bet-yes text-sm font-semibold"
                >
                  Buy YES
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    // In real app, this would open a bet modal
                  }}
                  className="flex-1 py-2 px-3 rounded-lg btn-bet-no text-sm font-semibold"
                >
                  Buy NO
                </button>
              </div>
            )}

            {/* Creator info */}
            {bet.creator && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <span className="text-xs text-gray-500">
                  Created by{' '}
                  <span className="text-gray-400">
                    {bet.creator.username || bet.creator.full_name || 'Anonymous'}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
