'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBalance } from '@/hooks/useBalance'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const { balance } = useBalance()
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const navItems = [
    { href: '/feed', label: 'Markets', icon: '📊' },
    { href: '/create', label: 'Create', icon: '➕' },
  ]

  if (!user) return null

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-market rounded-xl px-6 py-3 flex items-center justify-between border border-white/10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold gradient-market"
            >
              Prophet
            </motion.div>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "px-4 py-2 rounded-lg transition-all duration-300",
                      "flex items-center gap-2",
                      isActive
                        ? "bg-gradient-to-r from-market-blue/20 to-market-purple/20 text-white"
                        : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
                    )}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Balance Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-market rounded-lg px-4 py-2 border border-market-green/20"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Balance</span>
                <span className="text-sm font-bold text-market-green">
                  {balance?.toFixed(0) || '0'}
                </span>
                <span className="text-xs text-gray-500">credits</span>
              </div>
            </motion.div>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={cn(
                  "w-10 h-10 rounded-lg",
                  "bg-gradient-to-r from-market-blue to-market-purple",
                  "flex items-center justify-center",
                  "text-white font-bold",
                  "shadow-lg"
                )}
              >
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </motion.button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 glass-market rounded-lg border border-white/10 overflow-hidden"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm text-gray-200 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setShowUserMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-400 hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Market Ticker (optional decorative element) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 flex items-center gap-4 text-xs text-gray-500 px-6"
        >
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-market-green rounded-full animate-pulse"></span>
            Markets Online
          </span>
          <span>•</span>
          <span>24/7 Trading</span>
          <span>•</span>
          <span>Instant Settlement</span>
        </motion.div>
      </div>
    </motion.nav>
  )
}
