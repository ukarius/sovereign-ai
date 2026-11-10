import { Lock, CreditCard, Check, Sparkles, Star } from 'lucide-react'

interface StripePaywallProps {
  creatorName: string
}

export default function StripePaywall({ creatorName }: StripePaywallProps) {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['Public posts access', 'Basic community', 'Limited analytics'],
      cta: 'Current Plan',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: '/month',
      features: [
        'All exclusive content',
        'Private community access',
        'Direct messaging',
        'Monthly live sessions',
        'Behind-the-scenes content',
      ],
      cta: 'Subscribe Now',
      highlighted: true,
    },
    {
      name: 'VIP',
      price: '$29.99',
      period: '/month',
      features: [
        'Everything in Premium',
        '1-on-1 mentoring calls',
        'Custom content requests',
        'Priority support',
        'Early access to everything',
        'Exclusive merchandise',
      ],
      cta: 'Go VIP',
      highlighted: false,
    },
  ]

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
          <Lock className="w-4 h-4 text-accent-400" />
          <span className="text-accent-300 font-medium text-sm">Premium Content</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">
          Unlock {creatorName}&apos;s Full Library
        </h2>
        <p className="text-slate-600">
          Choose a plan that works for you and get instant access to all exclusive content.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl border p-6 transition-all duration-300 ${
              tier.highlighted
                ? 'border-sovereign-500/50 bg-sovereign-500/5 shadow-lg shadow-sovereign-500/10 scale-105'
                : 'glass-card hover:border-slate-300'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-slate-900"
                   style={{ background: 'var(--gradient-primary)' }}>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  MOST POPULAR
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-extrabold ${tier.highlighted ? 'gradient-text' : 'text-slate-900'}`}>
                  {tier.price}
                </span>
                <span className="text-slate-500 text-sm">{tier.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? 'text-sovereign-400' : 'text-slate-400'}`} />
                  <span className="text-sm text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                tier.highlighted
                  ? 'btn-primary'
                  : 'glass-card hover:border-sovereign-500/30 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {tier.highlighted && <CreditCard className="w-4 h-4" />}
                {tier.cta}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Trust badge */}
      <div className="text-center mt-8">
        <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Secured by Stripe · Cancel anytime · Instant access</span>
        </div>
      </div>
    </div>
  )
}
