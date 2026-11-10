import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FunnelChart from './FunnelChart'

// ═══════════════════════════════════════════════════════════════
// Project Sovereign — FunnelChart Component Test
// Phase 14 (Prompt 22) — Frontend Component Testing with Vitest
// ═══════════════════════════════════════════════════════════════

describe('FunnelChart', () => {
  const mockFunnelData = {
    IMPRESSION: 10000,
    CLICK: 3500,
    LANDING_VIEW: 2000,
    SIGNUP: 800,
    PURCHASE: 250,
  }

  it('renders the funnel chart with all stages', () => {
    render(<FunnelChart data={mockFunnelData} />)

    // Verify all stage labels are rendered
    expect(screen.getByText('Impressions')).toBeInTheDocument()
    expect(screen.getByText('Clicks')).toBeInTheDocument()
    expect(screen.getByText('Landing Views')).toBeInTheDocument()
    expect(screen.getByText('Signups')).toBeInTheDocument()
    expect(screen.getByText('Purchases')).toBeInTheDocument()
  })

  it('displays correct values for each stage', () => {
    render(<FunnelChart data={mockFunnelData} />)

    // Verify formatted numbers are displayed (with commas)
    expect(screen.getByText('10,000')).toBeInTheDocument()
    expect(screen.getByText('3,500')).toBeInTheDocument()
    expect(screen.getByText('2,000')).toBeInTheDocument()
    expect(screen.getByText('800')).toBeInTheDocument()
    expect(screen.getByText('250')).toBeInTheDocument()
  })

  it('calculates and displays conversion rates from previous stage', () => {
    render(<FunnelChart data={mockFunnelData} />)

    // Check for conversion percentages (35.0% from IMPRESSION to CLICK)
    expect(screen.getByText('35.0% from prev')).toBeInTheDocument()
  })

  it('displays percentage of total for each stage', () => {
    render(<FunnelChart data={mockFunnelData} />)

    // First stage should be 100%
    expect(screen.getByText('100.0%')).toBeInTheDocument()
  })

  it('handles zero values gracefully', () => {
    const zeroData = {
      IMPRESSION: 0,
      CLICK: 0,
      LANDING_VIEW: 0,
      SIGNUP: 0,
      PURCHASE: 0,
    }

    render(<FunnelChart data={zeroData} />)

    // Should still render without crashing
    expect(screen.getByText('Impressions')).toBeInTheDocument()
    expect(screen.getByText('Purchases')).toBeInTheDocument()
  })

  it('handles missing stage data', () => {
    const incompleteData = {
      IMPRESSION: 5000,
      // Missing other stages
    }

    render(<FunnelChart data={incompleteData} />)

    // Should render all stages with 0 for missing data
    expect(screen.getByText('Impressions')).toBeInTheDocument()
    expect(screen.getByText('Clicks')).toBeInTheDocument()
    expect(screen.getByText('Purchases')).toBeInTheDocument()
  })
})
