import type { Machine } from '../data/schemas/machine.js'

/**
 * Get the effective rigidity factor for a machine
 * Currently just returns the predefined factor
 * Future: Will support custom estimation when UI is implemented
 */
export function getEffectiveRigidityFactor(machine: Machine): number {
  return machine.rigidity_factor
}

/**
 * Get detailed rigidity analysis for a machine
 * Currently returns null as custom estimation is not yet integrated with UI
 * Future: Will provide analysis when custom machine input is implemented
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getMachineRigidityAnalysis(_machine: Machine): null {
  // Custom rigidity estimation will be implemented when UI supports it
  return null
}

/**
 * Validate that a machine has valid rigidity parameters
 * Currently always returns valid since all machines use predefined factors
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function validateCustomRigidityMachine(_machine: Machine): {
  isValid: boolean
  missingParameters: string[]
} {
  // All current machines use predefined rigidity factors
  return {
    isValid: true,
    missingParameters: []
  }
}