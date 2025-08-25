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
    whyItMatters: 'Balances productivity with safety. Hobby machines typically need lower aggressiveness due to reduced rigidity and power.',
    effects: {
      tooLow: 'Very slow material removal, excessive cycle times, potential for work hardening',
      tooHigh: 'Tool breakage, poor surface finish, excessive deflection, chatter',
      optimal: '3018 CNC: 0.3-0.5. Lowrider/Queenbee: 0.4-0.6. PrintNC: 0.6-0.8. Industrial: 0.8-1.2'
    },
    troubleshooting: [
      {
        problem: 'Tool breaking frequently',
        solution: 'Reduce aggressiveness to 0.3-0.5 for lightweight hobby machines'
      },
      {
        problem: 'Very slow machining',
        solution: 'Gradually increase aggressiveness by 0.1 increments while monitoring results'
      },
      {
        problem: 'Chatter or poor surface finish',
        solution: 'Reduce aggressiveness and check machine rigidity limitations'
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
    description: 'The machine\'s resistance to deflection under cutting forces. Varies significantly between machine types.',
    whyItMatters: 'Determines achievable accuracy, surface finish quality, and maximum safe cutting parameters.',
    effects: {
      optimal: '3018 CNC: Light cuts only. PrintNC: Moderate cuts possible. Entry VMC: Heavy cuts achievable.'
    },
    troubleshooting: [
      {
        problem: 'Chatter or vibration',
        solution: 'Reduce cutting forces, improve workholding, use shorter tools'
      },
      {
        problem: 'Poor accuracy',
        solution: 'Reduce forces, check machine calibration, improve rigidity where possible'
      }
    ]
  },

  hobbyMachineLimitations: {
    title: 'Hobby Machine Limitations',
    description: 'Hobby CNC machines have inherent limitations that require adjusted cutting strategies compared to industrial machines.',
    whyItMatters: 'Understanding these limitations prevents tool breakage, poor results, and machine damage while maximizing what hobby machines can achieve.',
    effects: {
      optimal: 'Conservative parameters with focus on tool life, surface finish quality, and machine longevity over pure productivity.'
    },
    troubleshooting: [
      {
        problem: 'Frequent tool breakage',
        solution: 'Reduce aggressiveness to 0.3-0.7, use shorter tools, reduce depth of cut'
      },
      {
        problem: 'Poor surface finish despite sharp tools',
        solution: 'Check machine rigidity, reduce cutting forces, improve workholding'
      },
      {
        problem: 'Machine stalling or skipping steps',
        solution: 'Reduce feed rates, check power requirements, reduce cutting forces'
      }
    ]
  },

  hobbyMachinePowerLimitations: {
    title: 'Hobby Machine Power Limitations',
    description: 'Most hobby machines use routers (0.5-1.5 HP) or small VFD spindles (0.8-2.2 kW), significantly less than industrial machines.',
    whyItMatters: 'Power limitations directly restrict material removal rates and limit the size of tools that can be used effectively.',
    effects: {
      tooHigh: 'Spindle stalling, motor overheating, reduced RPM under load, poor surface finish',
      optimal: 'Router: Best at 16-25k RPM with small tools. VFD: Better torque at low RPM, wider tool range.'
    },
    troubleshooting: [
      {
        problem: 'Spindle slowing down during cuts',
        solution: 'Reduce material removal rate, use smaller tools, reduce depth of cut'
      },
      {
        problem: 'Router overheating',
        solution: 'Take breaks between operations, reduce cutting time, improve dust collection'
      },
      {
        problem: 'Poor performance with large tools',
        solution: 'Use VFD spindle for tools >6mm, reduce cutting parameters significantly'
      }
    ]
  },

  hobbyMachineRigidityLimitations: {
    title: 'Hobby Machine Rigidity Limitations', 
    description: 'Hobby machines use aluminum extrusions, lightweight frames, and cost-optimized components resulting in 5-20x less rigidity than industrial machines.',
    whyItMatters: 'Low rigidity causes deflection under cutting forces, leading to inaccuracy, chatter, and poor surface finish.',
    effects: {
      tooHigh: 'Chatter, dimensional inaccuracy, poor surface finish, machine damage',
      optimal: '3018: 0.15 rigidity factor. Lowrider: 0.25. PrintNC: 0.6. Focus on light, frequent passes.'
    },
    troubleshooting: [
      {
        problem: 'Chatter marks on surface',
        solution: 'Reduce cutting forces, use climb milling, improve workholding rigidity'
      },
      {
        problem: 'Parts coming out wrong size',
        solution: 'Reduce forces, use compensation, take lighter passes'
      },
      {
        problem: 'Tool deflection visible in cuts',
        solution: 'Use shorter, larger diameter tools, reduce cutting forces'
      }
    ]
  },

  hobbyMachineToolingLimitations: {
    title: 'Hobby Machine Tooling Limitations',
    description: 'Hobby machines are limited to smaller tools due to power and rigidity constraints, typically 0.5-12mm end mills.',
    whyItMatters: 'Tool selection directly impacts achievable surface speeds, material removal rates, and part quality.',
    effects: {
      optimal: 'Small tools: Higher surface speeds but lower MRR. Focus on HSS for versatility, carbide for aluminum/plastics.'
    },
    troubleshooting: [
      {
        problem: 'Large end mills not cutting well',
        solution: 'Use smaller tools with multiple passes, reduce depth of cut significantly'
      },
      {
        problem: 'Tool deflection with long tools',
        solution: 'Use shortest possible stickout, larger diameter tools when possible'
      },
      {
        problem: 'Poor tool life',
        solution: 'Reduce cutting parameters, ensure sharp tools, use appropriate coatings'
      }
    ]
  },

  hobbyMachineBestPractices: {
    title: 'Hobby Machine Best Practices',
    description: 'Proven strategies for maximizing hobby machine performance while maintaining tool life and part quality.',
    whyItMatters: 'Following best practices prevents frustration, reduces costs, and produces better results from hobby equipment.',
    effects: {
      optimal: 'Consistent results, longer tool life, better surface finish, reduced machine wear.'
    },
    troubleshooting: [
      {
        problem: 'Inconsistent results',
        solution: 'Use proven feeds/speeds, maintain consistent workholding, regular machine maintenance'
      },
      {
        problem: 'High tool costs',
        solution: 'Use conservative parameters, proper tool storage, appropriate tool selection'
      },
      {
        problem: 'Long machining times',
        solution: 'Optimize toolpaths, use appropriate tools, balance speed vs tool life'
      }
    ]
  }
}

// Helper function to get educational content
export function getEducationalContent(key: string): EducationalContent | null {
  return educationalContent[key] || null
}