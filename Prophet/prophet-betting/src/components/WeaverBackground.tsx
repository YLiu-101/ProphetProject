'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface WeaverBackgroundProps {
  className?: string
}

export default function WeaverBackground({ className = '' }: WeaverBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const threadsRef = useRef<THREE.Points[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Optimize performance
    renderer.setClearColor(0x000000, 0)
    
    mountRef.current.appendChild(renderer.domElement)
    
    // Store references
    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera
    
    // Camera positioning - moved back for better view
    camera.position.z = 8

    // Create subtle weaver threads
    const createThread = (startX: number, startY: number, endX: number, endY: number, color: number, opacity: number = 0.4) => {
      const geometry = new THREE.BufferGeometry()
      const points = []
      const numPoints = 30 // Reduced for better performance
      
      // Create flowing thread path
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const x = startX + (endX - startX) * t + Math.sin(t * Math.PI * 3) * 0.5
        const y = startY + (endY - startY) * t + Math.cos(t * Math.PI * 2) * 0.3
        const z = Math.sin(t * Math.PI * 6) * 0.2
        points.push(x, y, z)
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
      
      // Create subtle material
      const material = new THREE.PointsMaterial({
        color: color,
        size: 0.015,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        vertexColors: false
      })
      
      const thread = new THREE.Points(geometry, material)
      scene.add(thread)
      threadsRef.current.push(thread)
      
      return thread
    }

    // Create fewer, more elegant threads
    const threads = []
    
    // Primary cyan threads - fewer and more subtle
    for (let i = 0; i < 4; i++) {
      const startX = -6 + Math.random() * 12
      const startY = -4 + Math.random() * 8
      const endX = -6 + Math.random() * 12
      const endY = -4 + Math.random() * 8
      threads.push(createThread(startX, startY, endX, endY, 0x00A99D, 0.3))
    }
    
    // Secondary violet threads - very subtle
    for (let i = 0; i < 2; i++) {
      const startX = -4 + Math.random() * 8
      const startY = -3 + Math.random() * 6
      const endX = -4 + Math.random() * 8
      const endY = -3 + Math.random() * 6
      threads.push(createThread(startX, startY, endX, endY, 0x7C5BFF, 0.2))
    }

    // Mouse interaction - more subtle
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    // Animation loop - optimized
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      const time = Date.now() * 0.0003 // Slower animation
      
      // Animate threads more subtly
      threadsRef.current.forEach((thread, index) => {
        // Very gentle floating motion
        thread.rotation.z = Math.sin(time + index * 0.8) * 0.01
        
        // Subtle mouse influence
        const mouseInfluence = 0.05
        thread.position.x = Math.sin(time + index * 1.2) * 0.2 + mouseRef.current.x * mouseInfluence
        thread.position.y = Math.cos(time + index * 0.9) * 0.15 + mouseRef.current.y * mouseInfluence
        
        // Gentle breathing effect
        const scale = 1 + Math.sin(time * 1.5 + index * 1.5) * 0.03
        thread.scale.setScalar(scale)
        
        // Subtle opacity pulsing
        if (thread.material instanceof THREE.PointsMaterial) {
          const baseOpacity = index < 4 ? 0.3 : 0.2
          thread.material.opacity = baseOpacity + Math.sin(time * 2 + index * 2) * 0.1
        }
      })
      
      renderer.render(scene, camera)
    }

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return
      
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', handleResize)
    
    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      // Dispose of Three.js objects
      threadsRef.current.forEach(thread => {
        if (thread.geometry) thread.geometry.dispose()
        if (thread.material instanceof THREE.Material) thread.material.dispose()
      })
      
      if (renderer) {
        renderer.dispose()
      }
    }
  }, [isClient])

  if (!isClient) {
    return null
  }

  return (
    <div 
      ref={mountRef} 
      className={`weaver-canvas ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.7 // Make it more subtle
      }}
    />
  )
} 