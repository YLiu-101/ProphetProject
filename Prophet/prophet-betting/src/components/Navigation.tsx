'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
    { href: '/feed', label: 'Markets' },
    { href: '/create', label: 'Create' },
  ]

  // Don't show navigation on the home page
  if (!user || pathname === '/') return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left Section - Navigation Links */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    {item.label}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Right Section - User Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Balance Display - Glass Panel */}
            <div className="hidden sm:block">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="glass px-4 py-2 rounded-2xl"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-secondary">Credits</span>
                  <div className="flex items-center space-x-1">
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          '0 0 0px var(--accent-primary-glow)',
                          '0 0 8px var(--accent-primary-glow)',
                          '0 0 0px var(--accent-primary-glow)'
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-2 h-2 bg-accent-primary rounded-full"
                    />
                    <span className="text-sm font-semibold text-success">
                      {balance?.toFixed(0) || '0'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* User Menu - Crystalline Avatar */}
            <div className="relative">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 20px var(--accent-primary-glow)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-12 h-12 rounded-full glass flex items-center justify-center font-semibold text-sm border border-accent-primary relative overflow-hidden"
              >
                {/* Crystalline background pattern */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-accent-primary to-accent-secondary opacity-20"
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <span className="relative z-10 text-primary">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </motion.button>

              {/* Dropdown Menu - Glass Panel */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-72 glass-elevated rounded-2xl overflow-hidden shadow-elevated"
                >
                  {/* User Info Section */}
                  <div className="p-6 border-b border-glass">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full glass flex items-center justify-center font-semibold text-sm border border-accent-primary">
                        <span className="text-primary">
                          {user?.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-tertiary uppercase tracking-wider mb-1">Trader</p>
                        <p className="text-sm font-medium text-primary truncate">{user?.email}</p>
                      </div>
                    </div>
                    
                    {/* Mobile Balance */}
                    <div className="mt-4 sm:hidden">
                      <div className="glass px-3 py-2 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-secondary">Credits</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-thread-glow" />
                            <span className="text-xs font-semibold text-success">
                              {balance?.toFixed(0) || '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Actions */}
                  <div className="p-4">
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        await supabase.auth.signOut()
                        setShowUserMenu(false)
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-secondary hover:text-primary hover:bg-muted rounded-xl transition-all duration-200 flex items-center space-x-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Toggle - Crystalline */}
            <div className="md:hidden">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary transition-colors glass rounded-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
