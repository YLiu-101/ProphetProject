'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BetCard from '@/components/BetCard'

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
    { value: 'all', label: 'All Markets' },
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' }
  ]

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gradient">
            Markets
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Trade on prediction markets and profit from your insights
          </p>
        </motion.div>

        {/* Market Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gradient mb-1">1,247</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Markets</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">$2.4M</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>24h Volume</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>8,923</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Traders</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>892</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Resolved Today</div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-2 mb-8"
        >
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as 'all' | 'active' | 'resolved')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === option.value
                  ? 'btn-primary'
                  : 'btn-ghost'
              }`}
            >
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Markets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl h-64 loading"
              />
            ))}
          </div>
        ) : bets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="glass rounded-2xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">
                No markets found
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Be the first to create a prediction market!
              </p>
              <button className="btn btn-primary">
                Create Market
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bets.map((bet, index) => (
              <BetCard key={bet.id} bet={bet} index={index} />
            ))}
          </div>
        )}

        {/* Load More */}
        {bets.length >= 20 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <button className="btn btn-secondary px-8 py-3">
              Load More Markets
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
