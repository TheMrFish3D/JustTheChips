// Educational content for various CNC parameters and concepts

export interface EducationalContent {
  title: string
  description: string
  whyItMatters: string
  effects: {
    tooLow?: string
    tooHigh?: string
    optimal?: string
  }
  troubleshooting?: {
    problem: string
    solution: string
  }[]
}

export const educationalContent: Record<string, EducationalContent> = {
  aggressiveness: {
    title: 'Aggressiveness Factor',
    description: 'Controls how conservative or aggressive the cutting parameters will be. Higher values push closer to theoretical limits.',
    whyItMatters: 'Balances productivity with safety. Hobby machines typically need lower aggressiveness due to reduced rigidity.',
    effects: {
      tooLow: 'Very slow material removal, excessive cycle times, potential for work hardening',
      tooHigh: 'Tool breakage, poor surface finish, excessive deflection, chatter',
      optimal: 'Maximum material removal rate while maintaining quality and tool life'
    },
    troubleshooting: [
      {
        problem: 'Tool breaking frequently',
        solution: 'Reduce aggressiveness to 0.5-0.7 for hobby machines'
      },
      {
        problem: 'Very slow machining',
        solution: 'Gradually increase aggressiveness while monitoring results'
      }
    ]
  },

  cutType: {
    title: 'Cut Type',
    description: 'Defines the machining operation type, which affects chip load, forces, and optimal parameters.',
    whyItMatters: 'Different operations have different force distributions and chip evacuation requirements.',
    effects: {
      optimal: 'Slotting: Full engagement, highest forces. Profile: Partial engagement, better surface finish. Adaptive: Variable engagement, best for roughing.'
    },
    troubleshooting: [
      {
        problem: 'Poor surface finish in slotting',
        solution: 'Switch to profile operation or reduce feed rate'
      },
      {
        problem: 'Slow roughing operation',
        solution: 'Use adaptive strategy with higher engagement'
      }
    ]
  },

  radialEngagement: {
    title: 'Radial Engagement (%)',
    description: 'Percentage of tool diameter engaged in the cut. Affects cutting forces and chip evacuation.',
    whyItMatters: 'Higher engagement removes more material but increases forces. Must balance with machine rigidity.',
    effects: {
      tooLow: 'Inefficient material removal, potential rubbing instead of cutting',
      tooHigh: 'Excessive forces, deflection, poor surface finish, tool breakage',
      optimal: '20-50% for hobby machines, up to 100% for slotting operations'
    },
    troubleshooting: [
      {
        problem: 'Machine deflection/vibration',
        solution: 'Reduce radial engagement to 20-30%'
      },
      {
        problem: 'Slow material removal',
        solution: 'Increase engagement gradually while monitoring forces'
      }
    ]
  },

  spindleSpeed: {
    title: 'Spindle Speed (RPM)',
    description: 'Rotational speed of the spindle, calculated from surface speed and tool diameter.',
    whyItMatters: 'Affects chip formation, tool life, surface finish, and power requirements.',
    effects: {
      tooLow: 'Poor surface finish, built-up edge, work hardening',
      tooHigh: 'Rapid tool wear, excessive heat, potential tool failure',
      optimal: 'Clean chip formation, optimal tool life, good surface finish'
    },
    troubleshooting: [
      {
        problem: 'Poor surface finish',
        solution: 'Increase RPM if below optimal, check if spindle can maintain power at speed'
      },
      {
        problem: 'Rapid tool wear',
        solution: 'Reduce RPM, check cooling, verify surface speed for material'
      }
    ]
  },

  feedRate: {
    title: 'Feed Rate (mm/min)',
    description: 'Rate at which the tool advances through the material, calculated from chip load and RPM.',
    whyItMatters: 'Determines material removal rate and affects surface finish, tool life, and cutting forces.',
    effects: {
      tooLow: 'Tool rubbing, work hardening, poor surface finish, reduced tool life',
      tooHigh: 'Tool breakage, excessive deflection, poor accuracy, machine overload',
      optimal: 'Proper chip formation, good surface finish, optimal productivity'
    },
    troubleshooting: [
      {
        problem: 'Tool leaving marks/rubbing',
        solution: 'Increase feed rate to ensure proper chip formation'
      },
      {
        problem: 'Machine stalling or excessive deflection',
        solution: 'Reduce feed rate, check if within machine limits'
      }
    ]
  },

  chipload: {
    title: 'Chip Load (mm/tooth)',
    description: 'Thickness of material removed by each cutting edge per revolution.',
    whyItMatters: 'Critical for proper chip formation and tool life. Too small causes rubbing, too large breaks tools.',
    effects: {
      tooLow: 'Rubbing instead of cutting, work hardening, premature tool wear',
      tooHigh: 'Tool breakage, excessive forces, poor surface finish',
      optimal: 'Clean chip formation, optimal tool life, good surface finish'
    },
    troubleshooting: [
      {
        problem: 'Tiny stringy chips',
        solution: 'Increase chip load by raising feed rate or reducing RPM'
      },
      {
        problem: 'Large chunks or tool chipping',
        solution: 'Reduce chip load, check if within tool manufacturer specs'
      }
    ]
  },

  toolDeflection: {
    title: 'Tool Deflection',
    description: 'Amount the tool bends under cutting forces, affected by tool geometry and cutting parameters.',
    whyItMatters: 'Directly affects accuracy and surface finish. Critical for hobby machines with limited rigidity.',
    effects: {
      tooHigh: 'Poor dimensional accuracy, surface finish issues, potential tool breakage, chatter'
    },
    troubleshooting: [
      {
        problem: 'Poor dimensional accuracy',
        solution: 'Use shorter, larger diameter tools; reduce cutting forces'
      },
      {
        problem: 'Surface finish issues',
        solution: 'Reduce depth of cut, increase tool rigidity, check deflection limits'
      }
    ]
  },

  stepover: {
    title: 'Stepover',
    description: 'Distance between adjacent tool paths in finishing operations.',
    whyItMatters: 'Determines surface finish quality and machining time. Smaller stepover = better finish but longer time.',
    effects: {
      tooLow: 'Excessive machining time, potential tool wear from overwork',
      tooHigh: 'Poor surface finish, visible tool marks, scalloping',
      optimal: 'Balance between finish quality and machining time'
    }
  },

  hobbyMachineLimitations: {
    title: 'Hobby Machine Limitations',
    description: 'Understanding the structural and power limitations that affect hobby CNC machine performance and parameter selection.',
    whyItMatters: 'Hobby machines require significantly reduced cutting parameters to prevent damage and maintain accuracy due to inherent design limitations.',
    effects: {
      optimal: 'Ultra-light (3018): 20-40% of industrial parameters. Medium hobby: 40-60%. Heavy hobby: 60-80%. Proper scaling prevents chatter, tool breakage, and poor accuracy.'
    },
    troubleshooting: [
      {
        problem: 'Excessive vibration/chatter',
        solution: 'Reduce aggressiveness to 30-50%, use shorter tools, decrease radial engagement to 20-30%'
      },
      {
        problem: 'Poor dimensional accuracy',
        solution: 'Limit tool deflection to <0.02mm, use carbide tools, minimize stickout length'
      },
      {
        problem: 'Tool breakage on hobby machines',
        solution: 'Reduce axial engagement by 50%, use climb milling only on rigid machines, check spindle runout'
      },
      {
        problem: 'Slow material removal',
        solution: 'Use adaptive clearing paths, optimize tool diameter for material, increase spindle speed if power allows'
      }
    ]
  },

  toolDeflectionLimits: {
    title: 'Tool Deflection Management',
    description: 'Critical deflection limits for maintaining accuracy and preventing tool failure, especially important for hobby machines.',
    whyItMatters: 'Excessive tool deflection causes poor surface finish, dimensional errors, and premature tool wear. Hobby machines are particularly susceptible due to reduced rigidity.',
    effects: {
      optimal: 'Precision work: <0.01mm deflection. General machining: <0.02mm. Roughing: <0.05mm. Hobby machines often limited to roughing tolerances.'
    },
    troubleshooting: [
      {
        problem: 'Calculated deflection >0.05mm',
        solution: 'Reduce cutting forces by 50%, use larger diameter tool, minimize stickout to 3x diameter'
      },
      {
        problem: 'Tapered walls or poor surface finish',
        solution: 'Tool deflection likely cause - reduce radial engagement, increase tool stiffness'
      },
      {
        problem: 'Tool chattering at depth',
        solution: 'Dynamic amplification issue - change RPM to avoid resonance, use shorter/stiffer tool'
      }
    ]
  },

  materialRemovalRate: {
    title: 'Material Removal Rate (MRR)',
    description: 'Volume of material removed per unit time, indicating machining efficiency.',
    whyItMatters: 'Higher MRR means faster production but requires adequate machine power and rigidity.',
    effects: {
      optimal: 'Balanced productivity with machine capabilities and part quality requirements'
    }
  },

  machineRigidity: {
    title: 'Machine Rigidity',
    description: 'The machine\'s resistance to deflection under cutting forces. Rigidity factors range from 0.15 (3018) to 0.8+ (VMC).',
    whyItMatters: 'Determines achievable accuracy, surface finish quality, and maximum safe cutting parameters. Lower rigidity requires exponentially reduced cutting forces.',
    effects: {
      optimal: 'Ultra-light (3018): 0.1-0.2 rigidity, aluminum only. Medium hobby: 0.2-0.4, light steel possible. Heavy hobby (PrintNC): 0.5-0.7, moderate steel cuts. Entry VMC: 0.7-0.9, near-industrial capability.'
    },
    troubleshooting: [
      {
        problem: 'Chatter or vibration on hobby machines',
        solution: 'Reduce aggressiveness to 30-50%, use trochoidal milling, check spindle mount tightness'
      },
      {
        problem: 'Poor dimensional accuracy',
        solution: 'Limit cutting forces based on rigidity factor, use shorter tools, take spring passes'
      },
      {
        problem: 'Machine deflection visible during cutting',
        solution: 'Immediately reduce all parameters by 50%, check machine assembly, consider workholding improvements'
      }
    ]
  }
}

// Helper function to get educational content
export function getEducationalContent(key: string): EducationalContent | null {
  return educationalContent[key] || null
}