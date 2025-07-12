'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function AaruPage() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Dynamically import three.js to avoid SSR issues
    import('three').then((THREE) => {
      if (!mountRef.current) return

      // Scene setup
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      
      renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.8)
      renderer.setClearColor(0x000000, 0)
      mountRef.current.appendChild(renderer.domElement)

      // Particle system for walking human figure
      const particleCount = 800
      const particles = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)
      
      // Create human-like figure structure
      const createHumanFigure = (frame: number) => {
        let index = 0
        
        // Walking animation parameters
        const walkCycle = (frame * 0.1) % (Math.PI * 2)
        const legSwing = Math.sin(walkCycle) * 0.3
        const armSwing = Math.sin(walkCycle + Math.PI) * 0.2
        const bodyBob = Math.sin(walkCycle * 2) * 0.05
        
        // Head
        for (let i = 0; i < 60; i++) {
          const phi = Math.acos(-1 + (2 * i) / 60)
          const theta = Math.sqrt(60 * Math.PI) * phi
          
          positions[index * 3] = 0.15 * Math.cos(theta) * Math.sin(phi)
          positions[index * 3 + 1] = 1.4 + bodyBob + 0.15 * Math.cos(phi)
          positions[index * 3 + 2] = 0.15 * Math.sin(theta) * Math.sin(phi)
          
          colors[index * 3] = 1
          colors[index * 3 + 1] = 1
          colors[index * 3 + 2] = 1
          index++
        }
        
        // Torso
        for (let i = 0; i < 120; i++) {
          const angle = (i / 120) * Math.PI * 2
          const height = (i / 120) * 0.8
          const radius = 0.2 * (1 - height * 0.3)
          
          positions[index * 3] = radius * Math.cos(angle)
          positions[index * 3 + 1] = 1.2 + bodyBob - height
          positions[index * 3 + 2] = radius * Math.sin(angle)
          
          colors[index * 3] = 1
          colors[index * 3 + 1] = 1
          colors[index * 3 + 2] = 1
          index++
        }
        
        // Left arm
        for (let i = 0; i < 80; i++) {
          const t = i / 80
          positions[index * 3] = -0.25 - t * 0.3
          positions[index * 3 + 1] = 1.0 + bodyBob - t * 0.6 + armSwing
          positions[index * 3 + 2] = t * 0.1
          
          colors[index * 3] = 1
          colors[index * 3 + 1] = 1
          colors[index * 3 + 2] = 1
          index++
        }
        
        // Right arm
        for (let i = 0; i < 80; i++) {
          const t = i / 80
          positions[index * 3] = 0.25 + t * 0.3
          positions[index * 3 + 1] = 1.0 + bodyBob - t * 0.6 - armSwing
          positions[index * 3 + 2] = t * 0.1
          
          colors[index * 3] = 1
          colors[index * 3 + 1] = 1
          colors[index * 3 + 2] = 1
          index++
        }
        
        // Left leg
        for (let i = 0; i < 100; i++) {
          const t = i / 100
          positions[index * 3] = -0.1
          positions[index * 3 + 1] = 0.4 + bodyBob - t * 0.4
          positions[index * 3 + 2] = t * legSwing
          
          colors[index * 3] = 1
          colors[index * 3 + 1] = 1
          colors[index * 3 + 2] = 1
          index++
        }
        
        // Right leg
        for (let i = 0; i < 100; i++) {
          const t = i / 100
          positions[index * 3] = 0.1
          positions[index * 3 + 1] = 0.4 + bodyBob - t * 0.4
          positions[index * 3 + 2] = -t * legSwing
          
          colors[index * 3] = 1
          colors[index * 3 + 1] = 1
          colors[index * 3 + 2] = 1
          index++
        }
        
        // Feet
        for (let i = 0; i < 160; i++) {
          const isLeft = i < 80
          const localI = i % 80
          const t = localI / 80
          
          positions[index * 3] = isLeft ? -0.1 : 0.1
          positions[index * 3 + 1] = 0.02
          positions[index * 3 + 2] = (isLeft ? legSwing : -legSwing) + t * 0.2 - 0.1
          
          colors[index * 3] = 1
          colors[index * 3 + 1] = 1
          colors[index * 3 + 2] = 1
          index++
        }
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      // Particle material
      const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      })

      const particleSystem = new THREE.Points(particles, material)
      scene.add(particleSystem)

      // Camera position
      camera.position.set(0, 1, 3)
      camera.lookAt(0, 1, 0)

      // Animation loop
      let frame = 0
      const animate = () => {
        frame += 1
        
        // Update particle positions for walking animation
        createHumanFigure(frame)
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        particles.attributes.position.needsUpdate = true
        
        // Slow rotation for better view
        particleSystem.rotation.y += 0.005
        
        renderer.render(scene, camera)
        requestAnimationFrame(animate)
      }
      
      animate()

      // Handle window resize
      const handleResize = () => {
        if (!mountRef.current) return
        
        const width = mountRef.current.clientWidth
        const height = mountRef.current.clientHeight
        
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
      }
      
      window.addEventListener('resize', handleResize)
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center">
        <div className="text-xl font-light">
          <span className="text-gray-400">#</span> aaru
        </div>
        
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-sm hover:text-gray-300 transition-colors">
            Home
          </Link>
          <Link href="/feed" className="text-sm hover:text-gray-300 transition-colors">
            Products
          </Link>
          <Link href="/create" className="text-sm hover:text-gray-300 transition-colors">
            About
          </Link>
          <button className="px-4 py-2 border border-white text-sm hover:bg-white hover:text-black transition-all duration-300 flex items-center space-x-2">
            <span>CONTACT</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Headline */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-light leading-tight">
              Rethinking The Science of{' '}
              <span className="text-gray-300">Prediction</span>
            </h1>
            
            {/* 3D Animation Container */}
            <div className="lg:hidden">
              <div 
                ref={mountRef}
                className="w-full h-96 flex items-center justify-center"
              />
            </div>
          </div>

          {/* Center - 3D Animation (Desktop) */}
          <div className="hidden lg:block">
            <div 
              ref={mountRef}
              className="w-full h-96 flex items-center justify-center"
            />
          </div>
        </div>
      </div>

      {/* Right Side Content */}
      <div className="px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl ml-auto space-y-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-xl font-light">Rendering Human Granularity</h3>
              <div className="w-12 h-px bg-white" />
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Aaru simulates entire populations to predict the world's events. 
              Welcome to the new age of decision dominance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 