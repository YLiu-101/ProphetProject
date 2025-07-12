'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/feed')
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email first')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setError('Check your email for the magic link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="glass-emphasis rounded-2xl p-8 shadow-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/">
              <motion.h1
                whileHover={{ scale: 1.02 }}
                className="text-4xl font-bold text-gradient mb-2 cursor-pointer"
              >
                Prophet
              </motion.h1>
            </Link>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to your account
            </p>
          </div>

          {/* Market stats decoration */}
          <div className="flex justify-center space-x-4 mb-8">
            <div className="glass rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-gradient">1,247</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Markets</div>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-success">$2.4M</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Volume</div>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>892</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="trader@example.com"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm text-center p-3 rounded-lg ${
                  error.includes('Check your email') 
                    ? "bg-green-500/10 text-success border border-green-500/20" 
                    : "bg-red-500/10 text-error border border-red-500/20"
                }`}
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={loading}
                className="btn btn-secondary w-full py-3 font-semibold disabled:opacity-50"
              >
                Send Magic Link
              </button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link href="/signup" className="text-info hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
