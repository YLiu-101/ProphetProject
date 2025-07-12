'use client'

import React, { useEffect, useRef } from 'react'

const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    let animationFrameId: number
    let particles: Particle[] = []
    let mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 150
    }
    
    // Particle class - defined before it's used in init()
    class Particle {
      x: number
      y: number
      baseX: number
      baseY: number
      vx: number
      vy: number
      size: number
      color: string
      density: number
      speed: number
      angle: number
      
      constructor(x: number, y: number, size: number, color: string) {
        this.x = x
        this.y = y
        this.baseX = x
        this.baseY = y
        this.size = size
        this.color = color
        this.density = (Math.random() * 30) + 1
        this.speed = Math.random() * 3 + 1
        this.angle = Math.random() * Math.PI * 2
        this.vx = Math.cos(this.angle) * this.speed
        this.vy = Math.sin(this.angle) * this.speed
      }
      
      // Update particle position
      update() {
        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x
          let dy = mouse.y - this.y
          let distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < mouse.radius) {
            let forceDirectionX = dx / distance
            let forceDirectionY = dy / distance
            let force = (mouse.radius - distance) / mouse.radius
            let pushForce = force * 12
            
            // Apply repulsion force
            this.vx -= forceDirectionX * pushForce
            this.vy -= forceDirectionY * pushForce
          }
        }
        
        // Update position with velocity
        this.x += this.vx
        this.y += this.vy
        
        // Check if particle has flown off screen and respawn
        const margin = 50
        if (this.x < -margin || this.x > canvas.width + margin || 
            this.y < -margin || this.y > canvas.height + margin) {
          this.respawn()
        }
        
        // Add slight random movement for more dynamic behavior
        this.angle += (Math.random() - 0.5) * 0.1
        this.vx += Math.cos(this.angle) * 0.03
        this.vy += Math.sin(this.angle) * 0.03
        
        // Apply minimal friction
        this.vx *= 0.995
        this.vy *= 0.995
        
        // Ensure minimum speed to keep them moving
        let currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (currentSpeed < 0.5) {
          this.vx += (Math.random() - 0.5) * 0.3
          this.vy += (Math.random() - 0.5) * 0.3
        }
      }
      
      // Respawn particle from random border edge
      respawn() {
        const side = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left
        const baseSpeed = 2 + Math.random() * 4 // High velocity between 2-6
        const randomOffset = (Math.random() - 0.5) * 0.8 // Some randomness in direction
        
        switch (side) {
          case 0: // Top edge
            this.x = Math.random() * canvas.width
            this.y = -20
            this.vx = (Math.random() - 0.5) * 3 + randomOffset
            this.vy = baseSpeed + Math.random() * 2
            break
          case 1: // Right edge
            this.x = canvas.width + 20
            this.y = Math.random() * canvas.height
            this.vx = -(baseSpeed + Math.random() * 2)
            this.vy = (Math.random() - 0.5) * 3 + randomOffset
            break
          case 2: // Bottom edge
            this.x = Math.random() * canvas.width
            this.y = canvas.height + 20
            this.vx = (Math.random() - 0.5) * 3 + randomOffset
            this.vy = -(baseSpeed + Math.random() * 2)
            break
          case 3: // Left edge
            this.x = -20
            this.y = Math.random() * canvas.height
            this.vx = baseSpeed + Math.random() * 2
            this.vy = (Math.random() - 0.5) * 3 + randomOffset
            break
        }
        
        // Update angle to match new velocity
        this.angle = Math.atan2(this.vy, this.vx)
        
        // Randomize color when respawning for extra dynamism
        const colorChoices = [
          `hsla(178, 100%, 33%, 0.8)`, // Cyan primary
          `hsla(178, 100%, 40%, 0.7)`, // Lighter cyan
          `hsla(250, 100%, 67%, 0.6)`, // Violet secondary
          `hsla(250, 100%, 75%, 0.5)`, // Lighter violet
          `hsla(220, 50%, 70%, 0.4)`,  // Blue tones
        ]
        this.color = colorChoices[Math.floor(Math.random() * colorChoices.length)]
      }
      
      // Draw particle
      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }
    }
    
    // Handle window resize
    function handleResize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      init()
    }
    
    // Handle mouse move
    function handleMouseMove(e: MouseEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    
    // Handle mouse out
    function handleMouseOut() {
      mouse.x = null
      mouse.y = null
    }
    
    // Create particles
    function init() {
      particles = []
      const particleCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 8000), 300)
      
      // Color scheme matching the Glass Weaver theme
      const colorChoices = [
        `hsla(178, 100%, 33%, 0.8)`, // Cyan primary (#00A99D)
        `hsla(178, 100%, 40%, 0.7)`, // Lighter cyan
        `hsla(250, 100%, 67%, 0.6)`, // Violet secondary (#7C5BFF)
        `hsla(250, 100%, 75%, 0.5)`, // Lighter violet
        `hsla(220, 50%, 70%, 0.4)`,  // Blue tones
      ]
      
      for (let i = 0; i < particleCount; i++) {
        let xPos, yPos
        
        // 30% chance to spawn from edges, 70% from inside screen
        if (Math.random() < 0.3) {
          // Spawn from edges
          const side = Math.floor(Math.random() * 4)
          switch (side) {
            case 0: // Top
              xPos = Math.random() * canvas.width
              yPos = -20
              break
            case 1: // Right
              xPos = canvas.width + 20
              yPos = Math.random() * canvas.height
              break
            case 2: // Bottom
              xPos = Math.random() * canvas.width
              yPos = canvas.height + 20
              break
            case 3: // Left
              xPos = -20
              yPos = Math.random() * canvas.height
              break
          }
        } else {
          // Spawn randomly within screen
          xPos = Math.random() * canvas.width
          yPos = Math.random() * canvas.height
        }
        
        const color = colorChoices[Math.floor(Math.random() * colorChoices.length)]
        const size = Math.random() * 2 + 1
        
        particles.push(new Particle(xPos, yPos, size, color))
      }
    }
    
    // Calculate distance between particles
    function connect() {
      const maxDistance = 100
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < maxDistance) {
            // Calculate opacity based on distance
            const opacity = 1 - (distance / maxDistance)
            
            // Draw lines between particles with Glass Weaver colors
            ctx.strokeStyle = `rgba(0, 169, 157, ${opacity * 0.7})` // Cyan primary
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
          }
        }
      }
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()
      }
      
      connect()
      
      animationFrameId = window.requestAnimationFrame(animate)
    }
    
    // Initialize canvas
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseout', handleMouseOut)
    
    animate()
    
    // Cleanup
    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 bg-gradient-to-br from-void to-black pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #09090B 0%, #000000 100%)'
      }}
    />
  )
}

export default InteractiveBackground 