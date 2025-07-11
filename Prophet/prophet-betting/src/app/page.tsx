'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sophisticated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 noise" />
      </div>

      {/* Floating orbs for depth */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gray-300/20 dark:bg-gray-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gray-400/20 dark:bg-gray-700/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo/Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-7xl md:text-8xl font-light tracking-tighter mb-6"
          >
            <span className="gradient-text">Prophet</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light mb-12 tracking-wide"
          >
            Where intuition meets opportunity
          </motion.p>

          {/* Glass card with description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="glass rounded-2xl p-8 md:p-12 mb-12 max-w-2xl mx-auto"
          >
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Create bets on anything. From personal milestones to world events. 
              Let friends or AI arbitrate. No complexity, just pure prediction.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-8 py-4 rounded-xl font-medium text-lg",
                  "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900",
                  "hover:bg-gray-800 dark:hover:bg-gray-200",
                  "transition-all duration-300",
                  "shadow-xl hover:shadow-2xl"
                )}
              >
                Start Predicting
              </motion.button>
            </Link>

            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-8 py-4 rounded-xl font-medium text-lg",
                  "glass border-gray-300 dark:border-gray-700",
                  "hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                  "transition-all duration-300"
                )}
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex gap-2">
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full" />
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full" />
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
