'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setError('Check your email to confirm your account!')
      setTimeout(() => router.push('/login'), 3000)
    }
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
              x: [0, -50],
              y: [0, -50],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      </div>

      {/* Floating market indicators */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-32 right-32 text-market-purple text-6xl font-bold opacity-20"
        >
          ↗
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-32 text-market-green text-6xl font-bold opacity-20"
        >
          ↗
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
              Join the future of prediction markets
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-market-green/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-market-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-xs text-gray-400">Trade on<br/>anything</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-market-blue/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-market-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-gray-400">Start with<br/>1000 credits</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-market-purple/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-market-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-xs text-gray-400">Secure &<br/>transparent</p>
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-lg",
                  "input-market text-white",
                  "placeholder-gray-500"
                )}
                placeholder="Prophet Trader"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
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
              transition={{ delay: 0.3 }}
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
                minLength={6}
              />
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300",
                      password.length === 0 ? "w-0" :
                      password.length < 6 ? "w-1/3 bg-market-red" :
                      password.length < 10 ? "w-2/3 bg-market-yellow" :
                      "w-full bg-market-green"
                    )}
                  />
                </div>
                <span className={cn(
                  "text-xs",
                  password.length === 0 ? "text-gray-500" :
                  password.length < 6 ? "text-market-red" :
                  password.length < 10 ? "text-market-yellow" :
                  "text-market-green"
                )}>
                  {password.length === 0 ? "Required" :
                   password.length < 6 ? "Weak" :
                   password.length < 10 ? "Good" :
                   "Strong"}
                </span>
              </div>
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
              transition={{ delay: 0.4 }}
            >
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full px-6 py-3 rounded-lg font-semibold",
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
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </motion.div>
          </form>

          {/* Terms */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <span className="text-market-blue cursor-pointer hover:underline">Terms</span> and{' '}
              <span className="text-market-blue cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </motion.div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-gray-500">Already trading?</span>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center justify-center w-full",
                "px-6 py-3 rounded-lg font-medium",
                "glass-market border border-white/10",
                "hover:bg-white/5 text-gray-300",
                "transition-all duration-300"
              )}
            >
              Sign In Instead
            </Link>
          </motion.div>
        </div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-market-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No fees
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-market-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Instant trades
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-market-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              24/7 markets
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
