import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, Zap, Globe } from 'lucide-react'
import apiClient from '../api/client'
import StripePaywall from '../components/StripePaywall'
import ZeroGOverlay from '../components/ZeroGOverlay'

interface CreatorProfile {
  id: string
  name: string
  niche: string
  slug: string
  bio: string
}

export default function LandingPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data: creator, isLoading } = useQuery<CreatorProfile>({
    queryKey: ['creator', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/public/creators/${slug}`)
      return res.data
    },
    enabled: !!slug,
  })

  if (slug && creator) {
    return <CreatorLanding creator={creator} />
  }

  return <PlatformLanding isLoading={isLoading && !!slug} />
}

/* ═══════════════ Personalized Creator Landing ═══════════════ */
function CreatorLanding({ creator }: { creator: CreatorProfile }) {
  const isGated = true

  return (
    <div className="min-h-screen mesh-bg">
      <div className="relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sovereign-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sovereign-500 to-accent-500 flex items-center justify-center animate-pulse-glow">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {creator.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 animate-fade-in">
            {creator.name}
          </h1>

          {creator.niche && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 animate-slide-up">
              <Sparkles className="w-4 h-4 text-sovereign-400" />
              <span className="text-sovereign-600 font-medium">{creator.niche}</span>
            </div>
          )}

          {creator.bio && (
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {creator.bio}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button className="btn-primary flex items-center justify-center gap-2 text-lg">
              <Zap className="w-5 h-5" />
              Subscribe Now
            </button>
            <button className="btn-accent flex items-center justify-center gap-2 text-lg">
              <Globe className="w-5 h-5" />
              View Free Content
            </button>
          </div>
        </div>
      </div>

      {isGated && (
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <StripePaywall creatorName={creator.name} />
        </div>
      )}
    </div>
  )
}

/* ═══════════════ Particle Canvas ═══════════════ */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0
    const mouse = { x: -9999, y: -9999 }
    const NODES = 80, DIST = 150, REPEL = 120

    class Particle {
      x: number; y: number; vx: number; vy: number
      r: number; baseAlpha: number; alpha: number; pulse: number

      constructor() {
        this.x = Math.random() * W; this.y = Math.random() * H
        this.vx = (Math.random() - 0.5) * 0.4; this.vy = (Math.random() - 0.5) * 0.4
        this.r = Math.random() * 2 + 1
        this.baseAlpha = Math.random() * 0.4 + 0.2; this.alpha = this.baseAlpha
        this.pulse = Math.random() * Math.PI * 2
      }

      update() {
        this.pulse += 0.02
        this.alpha = this.baseAlpha + Math.sin(this.pulse) * 0.1
        const dx = this.x - mouse.x, dy = this.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL && dist > 0) {
          const force = (REPEL - dist) / REPEL * 2
          this.vx += (dx / dist) * force * 0.3
          this.vy += (dy / dist) * force * 0.3
        }
        this.vx *= 0.98; this.vy *= 0.98
        this.x += this.vx; this.y += this.vy
        if (this.x < 0) { this.x = 0; this.vx *= -1 }
        if (this.x > W) { this.x = W; this.vx *= -1 }
        if (this.y < 0) { this.y = 0; this.vy *= -1 }
        if (this.y > H) { this.y = H; this.vy *= -1 }
      }

      draw() {
        ctx!.beginPath()
        ctx!.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(91,82,245,${this.alpha})`
        ctx!.fill()
      }
    }

    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }

    resize()
    const particles: Particle[] = Array.from({ length: NODES }, () => new Particle())

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => p.update())
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < DIST) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(91,82,245,${0.12 * (1 - d / DIST)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      particles.forEach(p => p.draw())
      animId = requestAnimationFrame(animate)
    }
    animate()

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    window.addEventListener('resize', resize)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="ag-particle-canvas" />
}

/* ═══════════════ Custom Cursor ═══════════════ */
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mx = 0, my = 0
    let dx = 0, dy = 0, rx = 0, ry = 0
    let animId: number

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
    }

    const tick = () => {
      // Dot: near-instant tracking (lerp 0.85)
      dx += (mx - dx) * 0.85
      dy += (my - dy) * 0.85
      dot.style.transform = `translate3d(${dx - 4}px,${dy - 4}px,0)`

      // Ring: smooth trailing (lerp 0.25)
      rx += (mx - rx) * 0.25
      ry += (my - ry) * 0.25
      ring.style.transform = `translate3d(${rx - 18}px,${ry - 18}px,0)`

      animId = requestAnimationFrame(tick)
    }
    tick()

    const onEnter = () => ring.classList.add('hovering')
    const onLeave = () => ring.classList.remove('hovering')

    document.addEventListener('mousemove', onMove, { passive: true })
    const hoverEls = document.querySelectorAll('a,button,[data-hover]')
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener('mousemove', onMove)
      hoverEls.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="ag-cursor-dot" />
      <div ref={ringRef} className="ag-cursor-ring" />
    </>
  )
}

/* ═══════════════ Scroll Reveal Hook ═══════════════ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = el.querySelectorAll('.ag-reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = (entry.target as HTMLElement).dataset.delay || '0'
            setTimeout(() => entry.target.classList.add('visible'), parseFloat(delay) * 1000)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '-40px' }
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  return ref
}

/* ═══════════════ Marquee Data ═══════════════ */
const TECH_STACK = ['FastAPI', 'React', 'TF-IDF', 'KNN', 'Framer Motion', '@dnd-kit', 'React Flow', 'WebGL', 'Matter.js', 'Scikit-Learn', 'WebSocket', 'Stripe']

const FEATURES = [
  { icon: '🚀', title: 'AI-Powered Publishing', desc: 'Publish to every platform simultaneously with AI-optimized content tags and smart scheduling.' },
  { icon: '📊', title: 'Conversion Analytics', desc: 'Real-time funnel tracking from impression to purchase with live WebSocket dashboards.' },
  { icon: '🤝', title: 'Brand Matchmaker', desc: 'DB-native scoring engine matches you with perfect brand sponsors algorithmically.' },
  { icon: '✨', title: 'AI Chat Assistant', desc: 'Context-aware AI that knows your metrics, content, and deals — always ready to help.' },
  { icon: '🛡️', title: 'Resilient Architecture', desc: 'Circuit breakers and rate limiters ensure your publishing never goes down.' },
  { icon: '👑', title: 'Creator-First Monetization', desc: 'Gated content funnels, Stripe integration, and automated sponsor discovery.' },
]

const STEPS = [
  { num: '01', icon: '🎯', title: 'AI Matches You', desc: 'Our neural network cross-references your audience demographics with active brand campaigns in real-time.' },
  { num: '02', icon: '📋', title: 'Manage Your Pipeline', desc: 'Drag-and-drop Kanban boards let you track every deal from pitch to payment effortlessly.' },
  { num: '03', icon: '💰', title: 'Close & Get Paid', desc: 'Automated contract generation and Stripe-powered instant payouts. Zero invoicing headaches.' },
]

/* ═══════════════ Platform Landing Page ═══════════════ */
function PlatformLanding({ isLoading }: { isLoading: boolean }) {
  const [isZeroGMode, setIsZeroGMode] = useState(false)
  const revealRef = useReveal()

  return (
    <div ref={revealRef} className="bg-[var(--ag-bg)]">
      <div className="ag-grid-overlay" />

      {/* Noise SVG */}
      <svg className="ag-noise" width="100%" height="100%">
        <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter>
        <rect width="100%" height="100%" filter="url(#noise)"/>
      </svg>

      {/* Glow Orbs */}
      <div className="ag-glow-orbs">
        <div className="ag-glow-orb purple" />
        <div className="ag-glow-orb blue" />
        <div className="ag-glow-orb pink" />
      </div>

      {/* Nav */}
      <nav className="ag-nav">
        <div className="ag-nav-logo">
          <div className="ag-nav-logo-icon">S</div>
          <div className="ag-nav-logo-text">Sovereign</div>
        </div>
        <div className="ag-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#roles">For Brands</a>
        </div>
        <div className="ag-nav-actions">
          <Link to="/auth?mode=login" className="ag-btn-ghost">Login</Link>
          <Link to="/auth?mode=register" className="ag-btn-primary-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="ag-hero">
        <ParticleCanvas />

        <div className="ag-hero-badge ag-reveal" data-delay="0">
          <div className="ag-badge-dot" />
          <span>The Creator Economy Operating System</span>
        </div>

        <h1 className="ag-reveal" data-delay="0.1">
          Own Your<br />
          <span className="ag-shimmer">Creative Empire</span>
        </h1>

        <p className="ag-hero-sub ag-reveal" data-delay="0.2">
          Publish everywhere. Analyze everything. Monetize intelligently.
          The all-in-one platform built for creators who mean business.
        </p>

        <div className="ag-hero-ctas ag-reveal" data-delay="0.3">
          <Link to="/auth?mode=register" className="ag-btn-hero">Start Building Free →</Link>
          <button className="ag-btn-outline">View Demo</button>
        </div>

        <div className="ag-stats-bar ag-reveal" data-delay="0.45">
          <div className="ag-stat">
            <div className="ag-stat-value">50K+</div>
            <div className="ag-stat-label">Creators</div>
          </div>
          <div className="ag-stat">
            <div className="ag-stat-value">$12M</div>
            <div className="ag-stat-label">Revenue Generated</div>
          </div>
          <div className="ag-stat">
            <div className="ag-stat-value">99.9%</div>
            <div className="ag-stat-label">Uptime</div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="ag-marquee">
        <div className="ag-marquee-track">
          {[...TECH_STACK, ...TECH_STACK].map((t, i) => (
            <span key={i}>{i > 0 && i % 1 === 0 ? '' : ''}{t}{i < TECH_STACK.length * 2 - 1 && <>&nbsp;&nbsp;·&nbsp;&nbsp;</>}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="ag-section" id="features">
        <div className="ag-section-pad">
          <div className="ag-reveal">
            <div className="ag-eyebrow">Core Platform</div>
            <h2 className="ag-section-title">Everything You Need to <span className="ag-shimmer">Dominate</span></h2>
            <p className="ag-section-sub">From AI content tagging to real-time analytics — every tool a modern creator needs.</p>
          </div>

          <div className="ag-features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="ag-feature-card ag-reveal" data-delay={String(0.1 + i * 0.1)}>
                <div className="ag-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="ag-section" id="how-it-works">
        <div className="ag-section-pad" style={{ textAlign: 'center' }}>
          <div className="ag-reveal">
            <div className="ag-eyebrow">How It Works</div>
            <h2 className="ag-section-title">Three Steps to <span className="ag-shimmer">Sovereignty</span></h2>
            <p className="ag-section-sub" style={{ margin: '0 auto' }}>Stop chasing. Start attracting. Our AI handles the heavy lifting.</p>
          </div>

          <div className="ag-steps-row">
            {STEPS.map((s, i) => (
              <div key={s.num} className="ag-step-card ag-reveal" data-delay={String(0.1 + i * 0.15)}>
                <div className="ag-step-num">{s.num}</div>
                <div className="ag-step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Role */}
      <section className="ag-section" id="roles">
        <div className="ag-section-pad" style={{ textAlign: 'center' }}>
          <div className="ag-reveal" style={{ marginBottom: 8 }}>
            <div className="ag-eyebrow">Built for Both Sides</div>
            <h2 className="ag-section-title">One Platform. <span className="ag-shimmer">Two Superpowers.</span></h2>
            <p className="ag-section-sub" style={{ margin: '0 auto' }}>Whether you're a brand seeking creators or a creator seeking deals — Sovereign has you covered.</p>
          </div>

          <div className="ag-dual-section ag-reveal" data-delay="0.15">
            <div className="ag-dual-col brand-col" style={{ textAlign: 'left' }}>
              <h3 style={{ color: 'var(--ag-accent)' }}>Brand Command Center</h3>
              <p className="ag-dual-sub">Discover, evaluate, and manage creator partnerships at scale.</p>
              <ul>
                <li><div className="ag-check purple">✓</div><span>AI-powered creator discovery with audience overlap scoring and sentiment analysis.</span></li>
                <li><div className="ag-check purple">✓</div><span>Bloomberg-style campaign dashboards with real-time ROI tracking.</span></li>
                <li><div className="ag-check purple">✓</div><span>Automated pitch deck generation tailored to each creator's audience.</span></li>
              </ul>
            </div>
            <div className="ag-dual-col creator-col" style={{ textAlign: 'left' }}>
              <h3 style={{ color: 'var(--ag-blue)' }}>Creator Toolkit</h3>
              <p className="ag-dual-sub">Monetize your influence with AI-driven tools built for growth.</p>
              <ul>
                <li><div className="ag-check blue">✓</div><span>Cross-platform publishing with AI-generated hashtags and optimal timing.</span></li>
                <li><div className="ag-check blue">✓</div><span>Conversion funnel analytics from impression to purchase, real-time.</span></li>
                <li><div className="ag-check blue">✓</div><span>Gated content monetization with Stripe and subscriber management.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="ag-cta">
        <div className="ag-cta-glow" />
        <div className="ag-reveal">
          <h2>Ready to be <span className="ag-shimmer">Sovereign</span>?</h2>
          <p>Join 50,000+ creators who stopped waiting for opportunities — and started building empires.</p>
          <Link to="/auth?mode=register" className="ag-btn-cta">Start Your Free Trial →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="ag-footer">
        <div className="ag-footer-logo">
          <div className="ag-footer-logo-icon">S</div>
          <span>Sovereign</span>
        </div>
        <div className="ag-footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Docs</a>
          <a href="#">Status</a>
        </div>
        <div className="ag-footer-copy">
          © 2026 Sovereign OS. All rights reserved.
          {/* Secret Zero-G Trigger */}
          <button
            onClick={() => setIsZeroGMode(true)}
            style={{
              marginLeft: 16, width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)',
              cursor: 'pointer', transition: 'all 0.5s', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle',
            }}
            title="Activate Zero-G"
            aria-label="Activate Zero-G Easter Egg"
          >
            <span style={{ fontSize: 12, opacity: 0.3, transition: 'all 0.5s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.25)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.3'; e.currentTarget.style.transform = 'scale(1)' }}
            >🧑‍🚀</span>
          </button>
        </div>
      </footer>

      {/* Zero-G Easter Egg */}
      {isZeroGMode && <ZeroGOverlay onRestore={() => setIsZeroGMode(false)} />}

      {isLoading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="w-8 h-8 border-2 border-sovereign-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
