'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BetCard from '@/components/BetCard'
import { cn } from '@/lib/utils'

export default function FeedPage() {
  const [bets, setBets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')

  useEffect(() => {
    fetchBets()
  }, [filter])

  const fetchBets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: filter,
        limit: '20',
        sort: 'created_at',
        order: 'desc'
      })

      const response = await fetch(`/api/bets?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch bets')
      }

      const data = await response.json()
      setBets(data.bets || [])
    } catch (error) {
      console.error('Error fetching bets:', error)
      setBets([])
    } finally {
      setLoading(false)
    }
  }

  const filterOptions = [
    { value: 'all', label: 'All Bets' },
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' }
  ]

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 noise" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-light tracking-tight mb-2 gradient-text">
            Explore Predictions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and participate in ongoing bets
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-heavy rounded-2xl p-2 mb-8 inline-flex"
        >
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                filter === option.value
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Bets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl h-48 animate-pulse"
              />
            ))}
          </div>
        ) : bets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="glass-heavy rounded-2xl p-12 max-w-md mx-auto">
              <p className="text-gray-600 dark:text-gray-400">
                No bets found. Be the first to create one!
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bets.map((bet, index) => (
              <BetCard key={bet.id} bet={bet} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
