import { describe, it, expect } from 'vitest'

import { machines } from './index.js'

/**
 * Tests to validate PrintNC rigidity analysis implementation
 * Ensures all PrintNC variants are properly loaded with correct rigidity factors
 */
describe('PrintNC Rigidity Analysis Validation', () => {
  it('should load all three PrintNC size variants', () => {
    const printncCompact = machines.find(m => m.id === 'printnc_compact')
    const printncStandard = machines.find(m => m.id === 'printnc_standard')
    const printncLarge = machines.find(m => m.id === 'printnc_large')

    expect(printncCompact).toBeDefined()
    expect(printncStandard).toBeDefined()
    expect(printncLarge).toBeDefined()
  })

  it('should have decreasing rigidity factors with increasing size', () => {
    const printncCompact = machines.find(m => m.id === 'printnc_compact')!
    const printncStandard = machines.find(m => m.id === 'printnc_standard')!
    const printncLarge = machines.find(m => m.id === 'printnc_large')!

    // Rigidity should decrease with size due to span effects
    expect(printncCompact.rigidity_factor).toBeGreaterThan(printncStandard.rigidity_factor)
    expect(printncStandard.rigidity_factor).toBeGreaterThan(printncLarge.rigidity_factor)
  })

  it('should have correct rigidity factors based on structural analysis', () => {
    const printncCompact = machines.find(m => m.id === 'printnc_compact')!
    const printncStandard = machines.find(m => m.id === 'printnc_standard')!
    const printncLarge = machines.find(m => m.id === 'printnc_large')!

    // Based on rigidity analysis in docs/research/printnc-rigidity-analysis.md
    expect(printncCompact.rigidity_factor).toBe(0.75)
    expect(printncStandard.rigidity_factor).toBe(0.65)
    expect(printncLarge.rigidity_factor).toBe(0.55)
  })

  it('should have appropriate feed rates for each size variant', () => {
    const printncCompact = machines.find(m => m.id === 'printnc_compact')!
    const printncStandard = machines.find(m => m.id === 'printnc_standard')!
    const printncLarge = machines.find(m => m.id === 'printnc_large')!

    // Smaller machines can typically achieve higher feed rates
    expect(printncCompact.axis_max_feed_mm_min).toBe(8000)
    expect(printncStandard.axis_max_feed_mm_min).toBe(7000)
    expect(printncLarge.axis_max_feed_mm_min).toBe(6000)
  })

  it('should have steel-construction appropriate aggressiveness factors', () => {
    const printncCompact = machines.find(m => m.id === 'printnc_compact')!
    const printncStandard = machines.find(m => m.id === 'printnc_standard')!
    const printncLarge = machines.find(m => m.id === 'printnc_large')!

    // All PrintNC variants should have high aggressiveness due to steel construction
    // Compact should be most aggressive, large should be least aggressive
    expect(printncCompact.aggressiveness.axial).toBe(0.8)
    expect(printncCompact.aggressiveness.radial).toBe(0.85)
    expect(printncCompact.aggressiveness.feed).toBe(0.85)

    expect(printncStandard.aggressiveness.axial).toBe(0.75)
    expect(printncStandard.aggressiveness.radial).toBe(0.8)
    expect(printncStandard.aggressiveness.feed).toBe(0.8)

    expect(printncLarge.aggressiveness.axial).toBe(0.7)
    expect(printncLarge.aggressiveness.radial).toBe(0.75)
    expect(printncLarge.aggressiveness.feed).toBe(0.75)
  })

  it('should have higher rigidity than aluminum extrusion machines', () => {
    const printncStandard = machines.find(m => m.id === 'printnc_standard')!
    const cnc3018 = machines.find(m => m.id === '3018_cnc')!
    const lowrider = machines.find(m => m.id === 'lowrider_v3')!

    // PrintNC should be significantly more rigid than aluminum machines
    expect(printncStandard.rigidity_factor).toBeGreaterThan(cnc3018.rigidity_factor * 2)
    expect(printncStandard.rigidity_factor).toBeGreaterThan(lowrider.rigidity_factor * 2)
  })
})