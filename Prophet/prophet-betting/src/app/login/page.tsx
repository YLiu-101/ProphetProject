'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
      {/* Market-style background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 gradient-radial-market" />
        <div className="absolute inset-0 noise" />
      </div>

      {/* Animated market grid */}
      <div className="fixed inset-0 -z-10 overflow-hidden opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}>
          <motion.div
            animate={{
              x: [0, 50],
              y: [0, 50],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      </div>

      {/* Floating market indicators */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 text-market-green text-2xl font-bold opacity-20"
        >
          +2.4%
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 text-market-red text-2xl font-bold opacity-20"
        >
          -1.8%
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="glass-market rounded-2xl p-8 shadow-2xl border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/">
              <motion.h1
                whileHover={{ scale: 1.02 }}
                className="text-4xl font-bold gradient-market mb-2 cursor-pointer"
              >
                Prophet
              </motion.h1>
            </Link>
            <p className="text-gray-400 text-sm">
              Enter the prediction market
            </p>
          </div>

          {/* Market stats decoration */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="stat-card">
              <div className="text-xs text-gray-500 mb-1">Markets</div>
              <div className="text-lg font-bold text-market-blue">1,247</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-gray-500 mb-1">Volume</div>
              <div className="text-lg font-bold text-market-green">$2.4M</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-gray-500 mb-1">Active</div>
              <div className="text-lg font-bold text-market-purple">892</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-lg",
                  "input-market text-white",
                  "placeholder-gray-500"
                )}
                placeholder="trader@example.com"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-lg",
                  "input-market text-white",
                  "placeholder-gray-500"
                )}
                placeholder="••••••••"
                required
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "text-sm text-center p-3 rounded-lg",
                  error.includes('Check your email') 
                    ? "bg-market-green/10 text-market-green border border-market-green/20" 
                    : "bg-market-red/10 text-market-red border border-market-red/20"
                )}
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full px-6 py-3 rounded-lg font-semibold",
                  "bg-gradient-to-r from-market-blue to-market-purple",
                  "hover:from-market-blue/90 hover:to-market-purple/90",
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
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={loading}
                className={cn(
                  "w-full px-6 py-3 rounded-lg font-medium",
                  "glass-market border border-white/10",
                  "hover:bg-white/5 text-gray-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-300"
                )}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Magic Link
                </span>
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-gray-500">New to Prophet?</span>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Link
              href="/signup"
              className={cn(
                "inline-flex items-center justify-center w-full",
                "px-6 py-3 rounded-lg font-medium",
                "border border-market-blue/30 text-market-blue",
                "hover:bg-market-blue/10 hover:border-market-blue/50",
                "transition-all duration-300"
              )}
            >
              Create Account
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            Secure • Fast • Decentralized
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
