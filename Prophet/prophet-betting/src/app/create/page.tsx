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
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 noise" />
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-light tracking-tight mb-2 gradient-text">
              Create a Prediction
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set the terms and let others join your bet
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What are you predicting?
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "glass border border-gray-300 dark:border-gray-700",
                  "focus:border-gray-500 dark:focus:border-gray-500",
                  "transition-all duration-300",
                  "placeholder-gray-500 dark:placeholder-gray-400"
                )}
                placeholder="I will complete my marathon in under 4 hours"
                required
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "glass border border-gray-300 dark:border-gray-700",
                  "focus:border-gray-500 dark:focus:border-gray-500",
                  "transition-all duration-300",
                  "placeholder-gray-500 dark:placeholder-gray-400",
                  "resize-none"
                )}
                rows={3}
                placeholder="Add any additional details or conditions..."
              />
            </motion.div>

            {/* Deadline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resolution deadline
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "glass border border-gray-300 dark:border-gray-700",
                  "focus:border-gray-500 dark:focus:border-gray-500",
                  "transition-all duration-300"
                )}
                required
              />
            </motion.div>

            {/* Arbitrator Type */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Who will verify the outcome?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'creator', label: 'Myself' },
                  { value: 'friend', label: 'A Friend' },
                  { value: 'ai', label: 'AI Judge' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, arbitratorType: option.value })}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                      formData.arbitratorType === option.value
                        ? "glass-heavy border-gray-900 dark:border-gray-100"
                        : "glass border-gray-300 dark:border-gray-700 hover:border-gray-500"
                    )}
                  >
                    {option.label}
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
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Friend's email
                </label>
                <input
                  type="email"
                  value={formData.arbitratorEmail}
                  onChange={(e) => setFormData({ ...formData, arbitratorEmail: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl",
                    "glass border border-gray-300 dark:border-gray-700",
                    "focus:border-gray-500 dark:focus:border-gray-500",
                    "transition-all duration-300",
                    "placeholder-gray-500 dark:placeholder-gray-400"
                  )}
                  placeholder="friend@example.com"
                  required
                />
              </motion.div>
            )}

            {/* Minimum Stake */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum stake (credits)
              </label>
              <input
                type="number"
                value={formData.minimumStake}
                onChange={(e) => setFormData({ ...formData, minimumStake: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "glass border border-gray-300 dark:border-gray-700",
                  "focus:border-gray-500 dark:focus:border-gray-500",
                  "transition-all duration-300"
                )}
                min="1"
                step="1"
                required
              />
            </motion.div>

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
                  "w-full px-6 py-4 rounded-xl font-medium text-lg",
                  "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900",
                  "hover:bg-gray-800 dark:hover:bg-gray-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-300",
                  "shadow-xl hover:shadow-2xl"
                )}
              >
                {loading ? 'Creating...' : 'Create Prediction'}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
