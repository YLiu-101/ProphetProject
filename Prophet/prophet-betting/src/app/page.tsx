'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import InteractiveBackground from '@/components/InteractiveBackground'

export default function Home() {
  return (
    <div className="min-h-screen relative">
      
      {/* Interactive Background */}
      <InteractiveBackground />
      
      {/* Prophet Title - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-prophet"
        >
          Prophet
        </motion.h1>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative z-10">
        
        {/* Primary Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.3 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-primary mb-6 leading-tight">
            Trade the
            <br />
            <span className="text-white">
              Future
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-secondary max-w-2xl mx-auto leading-relaxed">
            Create prediction markets. Place strategic bets. 
            Let AI arbitrate reality.
          </p>
        </motion.div>

        {/* Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 mb-20"
        >
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary px-12 py-5 text-xl font-semibold tracking-wide hover-glow"
            >
              Start Trading
            </motion.button>
          </Link>

          <Link href="/feed">
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-secondary px-12 py-5 text-xl font-semibold tracking-wide"
            >
              Browse Markets
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center text-tertiary"
        >
          <div className="text-xs uppercase tracking-widest mb-2">Explore</div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}
