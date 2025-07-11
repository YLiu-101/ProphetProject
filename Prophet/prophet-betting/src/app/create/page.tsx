'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function CreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    arbitratorType: 'ai',
    arbitratorEmail: '',
    minimumStake: '10'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.deadline) {
        throw new Error('Deadline is required')
      }
      if (!formData.minimumStake || parseFloat(formData.minimumStake) <= 0) {
        throw new Error('Valid minimum stake is required')
      }

      const deadlineDate = new Date(formData.deadline)
      if (deadlineDate <= new Date()) {
        throw new Error('Deadline must be in the future')
      }

      const response = await fetch('/api/create-market', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          deadline: deadlineDate.toISOString(),
          arbitrator_type: formData.arbitratorType,
          arbitrator_email: formData.arbitratorType === 'friend' ? formData.arbitratorEmail : null,
          stake_amount: parseFloat(formData.minimumStake)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create bet')
      }

      const data = await response.json()
      router.push(`/bet/${data.bet_id}`)
    } catch (error) {
      console.error('Error creating bet:', error)
      alert(error instanceof Error ? error.message : 'Failed to create bet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Market-style background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 gradient-radial-market" />
        <div className="absolute inset-0 noise" />
      </div>

      {/* Animated elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full opacity-10"
        >
          <div className="w-full h-full bg-gradient-conic from-market-blue via-market-purple to-market-blue rounded-full blur-3xl" />
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold gradient-market mb-2">
              Create Market
            </h1>
            <p className="text-gray-400">
              Set up a new prediction market and let traders bet on the outcome
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-market rounded-xl p-6 border border-white/10">
              {/* Market Question */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Market Question
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg",
                    "input-market text-white",
                    "placeholder-gray-500"
                  )}
                  placeholder="Will Bitcoin reach $100k by end of 2025?"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Frame as a yes/no question that can be definitively resolved
                </p>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution Criteria (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg",
                    "input-market text-white",
                    "placeholder-gray-500",
                    "resize-none"
                  )}
                  rows={3}
                  placeholder="Specify exact conditions for YES resolution..."
                />
              </motion.div>
            </div>

            {/* Market Settings */}
            <div className="glass-market rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Market Settings</h3>
              
              {/* Deadline */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg",
                    "input-market text-white",
                    "[color-scheme:dark]"
                  )}
                  required
                />
              </motion.div>

              {/* Minimum Stake */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Trade Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.minimumStake}
                    onChange={(e) => setFormData({ ...formData, minimumStake: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 pl-12 rounded-lg",
                      "input-market text-white"
                    )}
                    min="1"
                    step="1"
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    💰
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Arbitrator Selection */}
            <div className="glass-market rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Resolution Method</h3>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'creator', label: 'Self', icon: '👤', desc: 'You resolve' },
                    { value: 'friend', label: 'Trusted', icon: '🤝', desc: 'Friend resolves' },
                    { value: 'ai', label: 'AI Judge', icon: '🤖', desc: 'AI resolves' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, arbitratorType: option.value })}
                      className={cn(
                        "p-4 rounded-lg text-center transition-all duration-300",
                        formData.arbitratorType === option.value
                          ? "bg-gradient-to-r from-market-blue to-market-purple text-white"
                          : "glass-market border border-white/10 hover:border-white/20"
                      )}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Friend Email */}
              {formData.arbitratorType === 'friend' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Arbitrator&apos;s Email
                  </label>
                  <input
                    type="email"
                    value={formData.arbitratorEmail}
                    onChange={(e) => setFormData({ ...formData, arbitratorEmail: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg",
                      "input-market text-white",
                      "placeholder-gray-500"
                    )}
                    placeholder="trusted@friend.com"
                    required
                  />
                </motion.div>
              )}
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full px-6 py-4 rounded-lg font-semibold text-lg",
                  "bg-gradient-to-r from-market-green to-market-blue",
                  "hover:from-market-green/90 hover:to-market-blue/90",
                  "text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-300",
                  "shadow-lg hover:shadow-xl",
                  "transform hover:-translate-y-0.5"
                )}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Market...
                  </span>
                ) : 'Create Market'}
              </button>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <p className="text-xs text-gray-500">
                Markets are binding • Trades cannot be reversed • Resolution is final
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
