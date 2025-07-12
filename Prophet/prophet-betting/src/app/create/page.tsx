'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

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
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Create Market
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Set up a new prediction market and let traders bet on the outcome
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Market Question */}
            <div className="glass-emphasis rounded-xl p-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Market Question
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="Will Bitcoin reach $100k by end of 2025?"
                  required
                />
                <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
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
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Resolution Criteria (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input resize-none"
                  rows={3}
                  placeholder="Specify exact conditions for YES resolution..."
                />
              </motion.div>
            </div>

            {/* Market Settings */}
            <div className="glass-emphasis rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Market Settings</h3>
              
              {/* Deadline */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Resolution Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input"
                  style={{ colorScheme: 'dark' }}
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
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Minimum Trade Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.minimumStake}
                    onChange={(e) => setFormData({ ...formData, minimumStake: e.target.value })}
                    className="input pl-12"
                    min="1"
                    step="1"
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                    💰
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Arbitrator Selection */}
            <div className="glass-emphasis rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Resolution Method</h3>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'creator', label: 'Self Resolve', icon: '👤', desc: 'You resolve the market' },
                    { value: 'friend', label: 'Trusted Friend', icon: '🤝', desc: 'Friend resolves for you' },
                    { value: 'ai', label: 'AI Arbitrator', icon: '🤖', desc: 'AI resolves automatically' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, arbitratorType: option.value })}
                      className={`p-4 rounded-lg text-center transition-all duration-200 ${
                        formData.arbitratorType === option.value
                          ? "btn-primary"
                          : "glass border border-current opacity-30 hover:opacity-50"
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="text-sm font-medium mb-1">{option.label}</div>
                      <div className="text-xs" style={{ color: formData.arbitratorType === option.value ? 'currentColor' : 'var(--text-secondary)' }}>
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Friend Email Input */}
                {formData.arbitratorType === 'friend' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Friend's Email
                    </label>
                    <input
                      type="email"
                      value={formData.arbitratorEmail}
                      onChange={(e) => setFormData({ ...formData, arbitratorEmail: e.target.value })}
                      className="input"
                      placeholder="friend@example.com"
                      required
                    />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary flex-1 py-3 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 py-3 font-semibold disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Market'}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
