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
  }
  index?: number
}

export default function BetCard({ bet, index = 0 }: BetCardProps) {
  const deadlineDate = new Date(bet.deadline)
  const isExpired = deadlineDate < new Date()
  const daysLeft = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link href={`/bet/${bet.id}`}>
        <div className={cn(
          "glass rounded-2xl p-6 h-full",
          "border border-gray-200/50 dark:border-gray-700/50",
          "hover:border-gray-300 dark:hover:border-gray-600",
          "transition-all duration-300",
          "relative overflow-hidden"
        )}>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/20 dark:to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Status indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {bet.resolved ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Resolved</span>
                  </div>
                ) : isExpired ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Pending Resolution</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
                  </div>
                )}
              </div>
              
              {/* Time left */}
              {!bet.resolved && !isExpired && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
              {bet.title}
            </h3>

            {/* Description */}
            {bet.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {bet.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Participants */}
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {bet.participant_count || 0}
                  </span>
                </div>

                {/* Pool */}
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {bet.total_pool?.toFixed(0) || 0}
                  </span>
                </div>
              </div>

              {/* Creator */}
              {bet.creator && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  by {bet.creator.username || bet.creator.full_name || 'Anonymous'}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
