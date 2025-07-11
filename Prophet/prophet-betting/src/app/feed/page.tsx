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
    { value: 'all', label: 'All Markets', icon: '📊' },
    { value: 'active', label: 'Active', icon: '🟢' },
    { value: 'resolved', label: 'Resolved', icon: '✅' }
  ]

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Market-style background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 gradient-radial-market" />
        <div className="absolute inset-0 noise" />
      </div>

      {/* Animated grid */}
      <div className="fixed inset-0 -z-10 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 gradient-market">
            Prediction Markets
          </h1>
          <p className="text-gray-400">
            Trade on the future. Profit from your predictions.
          </p>
        </motion.div>

        {/* Market Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4 mb-8"
        >
          <div className="stat-card">
            <div className="text-xs text-gray-500 mb-1">Total Markets</div>
            <div className="text-2xl font-bold text-market-blue">1,247</div>
            <div className="text-xs text-market-green">+12.5%</div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-gray-500 mb-1">24h Volume</div>
            <div className="text-2xl font-bold text-market-green">$2.4M</div>
            <div className="text-xs text-market-green">+8.3%</div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-gray-500 mb-1">Active Traders</div>
            <div className="text-2xl font-bold text-market-purple">8,923</div>
            <div className="text-xs text-market-red">-2.1%</div>
          </div>
          <div className="stat-card">
            <div className="text-xs text-gray-500 mb-1">Markets Resolved</div>
            <div className="text-2xl font-bold text-gray-400">892</div>
            <div className="text-xs text-gray-500">Today</div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-8"
        >
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as 'all' | 'active' | 'resolved')}
              className={cn(
                "px-6 py-3 rounded-lg font-medium transition-all duration-300",
                "flex items-center gap-2",
                filter === option.value
                  ? "bg-gradient-to-r from-market-blue to-market-purple text-white shadow-lg"
                  : "glass-market border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20"
              )}
            >
              <span>{option.icon}</span>
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
                className="market-card rounded-xl h-64 animate-pulse-slow"
              />
            ))}
          </div>
        ) : bets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="glass-market rounded-2xl p-12 max-w-md mx-auto border border-white/10">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">
                No markets found
              </h3>
              <p className="text-gray-400">
                Be the first to create a prediction market!
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

        {/* Load More */}
        {bets.length >= 20 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <button className={cn(
              "px-8 py-3 rounded-lg font-medium",
              "glass-market border border-white/10",
              "hover:bg-white/5 text-gray-300",
              "transition-all duration-300"
            )}>
              Load More Markets
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
