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
    { href: '/feed', label: 'Explore' },
    { href: '/create', label: 'Create' },
  ]

  if (!user) return null

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-heavy rounded-2xl px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-light tracking-tight gradient-text"
            >
              Prophet
            </motion.div>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "px-4 py-2 rounded-xl transition-all duration-300",
                      isActive
                        ? "bg-gray-900/10 dark:bg-gray-100/10"
                        : "hover:bg-gray-900/5 dark:hover:bg-gray-100/5"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      isActive
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-600 dark:text-gray-400"
                    )}>
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Balance Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl px-4 py-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {balance?.toFixed(0) || '0'} credits
                </span>
              </div>
            </motion.div>

            {/* User Menu */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => supabase.auth.signOut()}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium",
                "glass hover:bg-gray-900/5 dark:hover:bg-gray-100/5",
                "transition-all duration-300"
              )}
            >
              Sign Out
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
