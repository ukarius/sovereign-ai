import { useEffect, useRef, useCallback, useState } from 'react'
import Matter from 'matter-js'

// ═══════════════ Types ═══════════════
interface UICardBody {
  label: string
  emoji: string
  width: number
  height: number
  color: string
  borderColor: string
  textColor: string
}

// ═══════════════ Card definitions matching our UI ═══════════════
const UI_CARDS: UICardBody[] = [
  {
    label: 'Sovereign OS',
    emoji: '👑',
    width: 200,
    height: 80,
    color: '#1a1040',
    borderColor: '#5c7cfa',
    textColor: '#dbe4ff',
  },
  {
    label: 'Pitch Studio',
    emoji: '🚀',
    width: 180,
    height: 70,
    color: '#1a0a2e',
    borderColor: '#9333ea',
    textColor: '#e9d5ff',
  },
  {
    label: 'Matchmaker',
    emoji: '🤝',
    width: 170,
    height: 70,
    color: '#0a1e3d',
    borderColor: '#3b82f6',
    textColor: '#bfdbfe',
  },
  {
    label: 'Analytics',
    emoji: '📊',
    width: 160,
    height: 65,
    color: '#0d2818',
    borderColor: '#22c55e',
    textColor: '#bbf7d0',
  },
  {
    label: 'AI Chat',
    emoji: '✨',
    width: 150,
    height: 65,
    color: '#2d1a0a',
    borderColor: '#f59e0b',
    textColor: '#fef3c7',
  },
  {
    label: 'Resilience',
    emoji: '🛡️',
    width: 165,
    height: 65,
    color: '#1a0a0a',
    borderColor: '#ef4444',
    textColor: '#fecaca',
  },
  {
    label: 'Monetization',
    emoji: '💰',
    width: 185,
    height: 70,
    color: '#1a1a00',
    borderColor: '#eab308',
    textColor: '#fef9c3',
  },
  {
    label: 'Publishing',
    emoji: '📡',
    width: 170,
    height: 65,
    color: '#0a1a2d',
    borderColor: '#06b6d4',
    textColor: '#cffafe',
  },
  {
    label: 'Creator Hub',
    emoji: '🎨',
    width: 175,
    height: 70,
    color: '#2d0a1a',
    borderColor: '#ec4899',
    textColor: '#fbcfe8',
  },
  {
    label: 'Brand Deals',
    emoji: '💎',
    width: 165,
    height: 65,
    color: '#0a0a2d',
    borderColor: '#8b5cf6',
    textColor: '#ddd6fe',
  },
]

// ═══════════════ Space Particle type ═══════════════
interface SpaceParticle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  twinklePhase: number
  twinkleSpeed: number
}

// ═══════════════ Component ═══════════════
export default function ZeroGOverlay({ onRestore }: { onRestore: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null)
  const animFrameRef = useRef<number>(0)
  const particlesRef = useRef<SpaceParticle[]>([])
  const [isGravityFlipped, setIsGravityFlipped] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Custom render function for rich card visuals
  const renderBodies = useCallback(
    (ctx: CanvasRenderingContext2D, bodies: Matter.Body[], time: number) => {
      bodies.forEach((body) => {
        if (body.isStatic) return

        const cardData = (body as any).__cardData as UICardBody | undefined
        if (!cardData) return

        ctx.save()
        ctx.translate(body.position.x, body.position.y)
        ctx.rotate(body.angle)

        const w = cardData.width
        const h = cardData.height
        const halfW = w / 2
        const halfH = h / 2

        // Glow effect
        const glowIntensity = 0.3 + Math.sin(time * 0.002 + body.id) * 0.15
        ctx.shadowColor = cardData.borderColor
        ctx.shadowBlur = 20 * glowIntensity
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Card background with rounded corners
        const radius = 16
        ctx.beginPath()
        ctx.moveTo(-halfW + radius, -halfH)
        ctx.lineTo(halfW - radius, -halfH)
        ctx.arcTo(halfW, -halfH, halfW, -halfH + radius, radius)
        ctx.lineTo(halfW, halfH - radius)
        ctx.arcTo(halfW, halfH, halfW - radius, halfH, radius)
        ctx.lineTo(-halfW + radius, halfH)
        ctx.arcTo(-halfW, halfH, -halfW, halfH - radius, radius)
        ctx.lineTo(-halfW, -halfH + radius)
        ctx.arcTo(-halfW, -halfH, -halfW + radius, -halfH, radius)
        ctx.closePath()

        // Glass-like fill
        const grad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH)
        grad.addColorStop(0, cardData.color + 'dd')
        grad.addColorStop(1, cardData.color + '99')
        ctx.fillStyle = grad
        ctx.fill()

        // Border
        ctx.shadowBlur = 0
        ctx.strokeStyle = cardData.borderColor + '88'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Shine line at top
        ctx.beginPath()
        ctx.moveTo(-halfW + radius + 10, -halfH + 1)
        ctx.lineTo(halfW - radius - 10, -halfH + 1)
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.lineWidth = 1
        ctx.stroke()

        // Emoji
        ctx.font = `${Math.min(w, h) * 0.35}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(cardData.emoji, 0, -8)

        // Label
        ctx.font = `600 ${Math.max(11, Math.min(w, h) * 0.16)}px Inter, system-ui, sans-serif`
        ctx.fillStyle = cardData.textColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(cardData.label, 0, halfH - 18)

        ctx.restore()
      })
    },
    []
  )

  // Render space particles
  const renderParticles = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
      particlesRef.current.forEach((p) => {
        const twinkle = 0.5 + Math.sin(time * p.twinkleSpeed + p.twinklePhase) * 0.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 210, 255, ${p.opacity * twinkle})`
        ctx.fill()

        // Move slowly
        p.y -= p.speed * 0.3
        if (p.y < -5) {
          p.y = h + 5
          p.x = Math.random() * w
        }
      })
    },
    []
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w
    canvas.height = h

    // ═══════════════ Initialize space particles ═══════════════
    const particles: SpaceParticle[] = []
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.6 + 0.2,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.003 + 0.001,
      })
    }
    particlesRef.current = particles

    // ═══════════════ Matter.js Engine ═══════════════
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: -0.15, scale: 0.001 },
    })
    engineRef.current = engine

    // ═══════════════ Walls (invisible) ═══════════════
    const wallThickness = 60
    const walls = [
      // Floor
      Matter.Bodies.rectangle(w / 2, h + wallThickness / 2, w + 200, wallThickness, {
        isStatic: true,
        restitution: 0.8,
        friction: 0.05,
      }),
      // Ceiling
      Matter.Bodies.rectangle(w / 2, -wallThickness / 2, w + 200, wallThickness, {
        isStatic: true,
        restitution: 0.8,
        friction: 0.05,
      }),
      // Left wall
      Matter.Bodies.rectangle(-wallThickness / 2, h / 2, wallThickness, h + 200, {
        isStatic: true,
        restitution: 0.8,
        friction: 0.05,
      }),
      // Right wall
      Matter.Bodies.rectangle(w + wallThickness / 2, h / 2, wallThickness, h + 200, {
        isStatic: true,
        restitution: 0.8,
        friction: 0.05,
      }),
    ]

    Matter.Composite.add(engine.world, walls)

    // ═══════════════ Create UI card bodies ═══════════════
    const cardBodies: Matter.Body[] = []

    UI_CARDS.forEach((card, index) => {
      const cols = 3
      const spacingX = w / (cols + 1)
      const spacingY = 120
      const col = index % cols
      const row = Math.floor(index / cols)

      // Scatter them around the middle of the screen
      const x = spacingX * (col + 1) + (Math.random() - 0.5) * 80
      const y = h * 0.3 + row * spacingY + (Math.random() - 0.5) * 40

      const body = Matter.Bodies.rectangle(x, y, card.width, card.height, {
        restitution: 0.6,
        friction: 0.1,
        frictionAir: 0.015,
        density: 0.002,
        chamfer: { radius: 16 },
        angle: (Math.random() - 0.5) * 0.3,
      })

      // Store our card data on the body for custom rendering
      ;(body as any).__cardData = card

      // Give a random initial push so they scatter
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 4,
      })

      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05)

      cardBodies.push(body)
    })

    Matter.Composite.add(engine.world, cardBodies)

    // ═══════════════ Mouse Constraint ═══════════════
    const mouse = Matter.Mouse.create(canvas)

    // Fix for high DPI displays
    mouse.pixelRatio = window.devicePixelRatio || 1

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      } as any,
    })

    mouseConstraintRef.current = mouseConstraint
    Matter.Composite.add(engine.world, mouseConstraint)

    // ═══════════════ Runner ═══════════════
    const runner = Matter.Runner.create()
    runnerRef.current = runner
    Matter.Runner.run(runner, engine)

    // ═══════════════ Custom Render Loop ═══════════════
    const render = (time: number) => {
      ctx.clearRect(0, 0, w, h)

      // Deep space background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7)
      bgGrad.addColorStop(0, '#0d1117')
      bgGrad.addColorStop(0.5, '#080c14')
      bgGrad.addColorStop(1, '#030508')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      // Nebula-like splotches
      const nebulaGrad1 = ctx.createRadialGradient(w * 0.25, h * 0.3, 0, w * 0.25, h * 0.3, 300)
      nebulaGrad1.addColorStop(0, 'rgba(92, 124, 250, 0.04)')
      nebulaGrad1.addColorStop(1, 'transparent')
      ctx.fillStyle = nebulaGrad1
      ctx.fillRect(0, 0, w, h)

      const nebulaGrad2 = ctx.createRadialGradient(w * 0.75, h * 0.7, 0, w * 0.75, h * 0.7, 250)
      nebulaGrad2.addColorStop(0, 'rgba(236, 72, 153, 0.03)')
      nebulaGrad2.addColorStop(1, 'transparent')
      ctx.fillStyle = nebulaGrad2
      ctx.fillRect(0, 0, w, h)

      // Space particles (stars)
      renderParticles(ctx, w, h, time)

      // Render card bodies
      const allBodies = Matter.Composite.allBodies(engine.world)
      renderBodies(ctx, allBodies, time)

      // Render grab indicator when holding a body
      if (mouseConstraint.body) {
        const b = mouseConstraint.body
        ctx.save()
        ctx.beginPath()
        ctx.arc(b.position.x, b.position.y, Math.max((b as any).__cardData?.width ?? 80, (b as any).__cardData?.height ?? 60) * 0.7, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(92, 124, 250, ${0.15 + Math.sin(time * 0.005) * 0.1})`
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 4])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    // ═══════════════ Resize handler ═══════════════
    const handleResize = () => {
      const newW = window.innerWidth
      const newH = window.innerHeight
      canvas.width = newW
      canvas.height = newH
    }
    window.addEventListener('resize', handleResize)

    // ═══════════════ Cleanup ═══════════════
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animFrameRef.current)
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current)
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false)
        Matter.Engine.clear(engineRef.current)
      }
    }
  }, [renderBodies, renderParticles])

  // ═══════════════ Gravity flip ═══════════════
  const flipGravity = useCallback(() => {
    if (!engineRef.current) return
    const g = engineRef.current.gravity
    g.y = isGravityFlipped ? -0.15 : 0.8
    setIsGravityFlipped(!isGravityFlipped)

    // Add impulse to all bodies for dramatic effect
    const bodies = Matter.Composite.allBodies(engineRef.current.world)
    bodies.forEach((body) => {
      if (!body.isStatic) {
        Matter.Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * 0.03,
          y: isGravityFlipped ? -0.04 : 0.04,
        })
      }
    })
  }, [isGravityFlipped])

  // ═══════════════ Shake / Explode ═══════════════
  const explodeBodies = useCallback(() => {
    if (!engineRef.current) return
    const bodies = Matter.Composite.allBodies(engineRef.current.world)
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2

    bodies.forEach((body) => {
      if (!body.isStatic) {
        const dx = body.position.x - cx
        const dy = body.position.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = 0.08

        Matter.Body.applyForce(body, body.position, {
          x: (dx / dist) * force,
          y: (dy / dist) * force,
        })
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3)
      }
    })
  }, [])

  // ═══════════════ Restore with animation ═══════════════
  const handleRestore = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onRestore()
    }, 600)
  }, [onRestore])

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-500 ${
        isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      style={{ transformOrigin: 'center center', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: 'grab' }}
      />

      {/* ═══════════════ Control Panel ═══════════════ */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        {/* Gravity Flip */}
        <button
          onClick={flipGravity}
          className="group relative px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden"
          style={{
            background: isGravityFlipped
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            boxShadow: isGravityFlipped
              ? '0 0 25px rgba(34,197,94,0.4)'
              : '0 0 25px rgba(139,92,246,0.4)',
          }}
        >
          <span className="relative z-10 flex items-center gap-2 text-slate-900">
            {isGravityFlipped ? '🌍' : '🪐'}{' '}
            {isGravityFlipped ? 'Normal Gravity' : 'Zero-G Float'}
          </span>
        </button>

        {/* Explode */}
        <button
          onClick={explodeBodies}
          className="px-5 py-3 rounded-xl font-semibold text-sm text-slate-900 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            boxShadow: '0 0 25px rgba(245,158,11,0.4)',
          }}
        >
          <span className="flex items-center gap-2">💥 Explode</span>
        </button>

        {/* Restore */}
        <button
          onClick={handleRestore}
          className="px-5 py-3 rounded-xl font-semibold text-sm text-slate-900 transition-all duration-300 animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            boxShadow: '0 0 30px rgba(239,68,68,0.5)',
          }}
        >
          <span className="flex items-center gap-2">🔄 Restore Reality</span>
        </button>
      </div>

      {/* ═══════════════ Title ═══════════════ */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <h2
          className="text-2xl font-bold font-display tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #5c7cfa, #c084fc, #f06595)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 20px rgba(92,124,250,0.3))',
          }}
        >
          ☄️ Z E R O – G &nbsp; M O D E ☄️
        </h2>
        <p className="text-xs text-slate-900/40 mt-2 tracking-widest uppercase">
          Grab • Drag • Throw • Destroy
        </p>
      </div>

      {/* ═══════════════ Corner decor ═══════════════ */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: '#5c7cfa', boxShadow: '0 0 12px #5c7cfa' }}
        />
      </div>
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            background: '#f06595',
            boxShadow: '0 0 12px #f06595',
            animationDelay: '0.5s',
          }}
        />
      </div>
    </div>
  )
}
