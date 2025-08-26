// Material properties database for machining calculations
// Surface feet per minute (SFM) and chip load recommendations

export interface MaterialProperties {
  id: string
  name: string
  category: string
  // Surface speed in feet per minute (SFM) for different tool materials
  sfm: {
    hss: number      // High Speed Steel
    carbide: number  // Carbide
    ceramic: number  // Ceramic
    diamond: number  // Diamond
  }
  // Chip load per tooth in inches (for different tool types and finishes)
  chipLoad: {
    roughing: {
      flatEndmill: number
      ballEndmill: number
      drill: number
    }
    finishing: {
      flatEndmill: number
      ballEndmill: number
      drill: number
    }
  }
  // Material cutting coefficients
  specificCuttingForce: number  // N/mm² (cutting force per unit area)
  machinabilityRating: number   // 1-10 scale (10 = easiest to machine)
  workHardening: number         // Factor for work hardening (1 = none, 2 = high)
  thermalConductivity: number   // W/m·K (affects heat dissipation)
}

export const materialsDatabase: MaterialProperties[] = [
  // Wood Materials
  {
    id: 'hardwood',
    name: 'Hardwood',
    category: 'Wood',
    sfm: { hss: 400, carbide: 800, ceramic: 1200, diamond: 1500 },
    chipLoad: {
      roughing: { flatEndmill: 0.005, ballEndmill: 0.003, drill: 0.004 },
      finishing: { flatEndmill: 0.003, ballEndmill: 0.002, drill: 0.003 }
    },
    specificCuttingForce: 50,
    machinabilityRating: 9,
    workHardening: 1.0,
    thermalConductivity: 0.15
  },
  {
    id: 'softwood',
    name: 'Softwood',
    category: 'Wood',
    sfm: { hss: 500, carbide: 1000, ceramic: 1500, diamond: 2000 },
    chipLoad: {
      roughing: { flatEndmill: 0.008, ballEndmill: 0.005, drill: 0.006 },
      finishing: { flatEndmill: 0.005, ballEndmill: 0.003, drill: 0.004 }
    },
    specificCuttingForce: 30,
    machinabilityRating: 10,
    workHardening: 1.0,
    thermalConductivity: 0.12
  },
  {
    id: 'plywood',
    name: 'Plywood',
    category: 'Wood',
    sfm: { hss: 350, carbide: 700, ceramic: 1000, diamond: 1300 },
    chipLoad: {
      roughing: { flatEndmill: 0.004, ballEndmill: 0.003, drill: 0.003 },
      finishing: { flatEndmill: 0.002, ballEndmill: 0.002, drill: 0.002 }
    },
    specificCuttingForce: 60,
    machinabilityRating: 8,
    workHardening: 1.0,
    thermalConductivity: 0.13
  },
  {
    id: 'mdf',
    name: 'MDF',
    category: 'Wood',
    sfm: { hss: 300, carbide: 600, ceramic: 900, diamond: 1200 },
    chipLoad: {
      roughing: { flatEndmill: 0.003, ballEndmill: 0.002, drill: 0.003 },
      finishing: { flatEndmill: 0.002, ballEndmill: 0.001, drill: 0.002 }
    },
    specificCuttingForce: 40,
    machinabilityRating: 9,
    workHardening: 1.0,
    thermalConductivity: 0.10
  },

  // Plastic Materials
  {
    id: 'acrylic',
    name: 'Acrylic',
    category: 'Plastic',
    sfm: { hss: 200, carbide: 400, ceramic: 600, diamond: 800 },
    chipLoad: {
      roughing: { flatEndmill: 0.003, ballEndmill: 0.002, drill: 0.002 },
      finishing: { flatEndmill: 0.002, ballEndmill: 0.001, drill: 0.001 }
    },
    specificCuttingForce: 80,
    machinabilityRating: 8,
    workHardening: 1.1,
    thermalConductivity: 0.19
  },
  {
    id: 'delrin',
    name: 'Delrin (POM)',
    category: 'Plastic',
    sfm: { hss: 300, carbide: 600, ceramic: 900, diamond: 1200 },
    chipLoad: {
      roughing: { flatEndmill: 0.004, ballEndmill: 0.003, drill: 0.003 },
      finishing: { flatEndmill: 0.003, ballEndmill: 0.002, drill: 0.002 }
    },
    specificCuttingForce: 100,
    machinabilityRating: 9,
    workHardening: 1.0,
    thermalConductivity: 0.23
  },
  {
    id: 'nylon',
    name: 'Nylon',
    category: 'Plastic',
    sfm: { hss: 250, carbide: 500, ceramic: 750, diamond: 1000 },
    chipLoad: {
      roughing: { flatEndmill: 0.003, ballEndmill: 0.002, drill: 0.002 },
      finishing: { flatEndmill: 0.002, ballEndmill: 0.001, drill: 0.001 }
    },
    specificCuttingForce: 120,
    machinabilityRating: 7,
    workHardening: 1.2,
    thermalConductivity: 0.25
  },

  // Aluminum Materials
  {
    id: 'aluminum-6061',
    name: 'Aluminum 6061',
    category: 'Aluminum',
    sfm: { hss: 200, carbide: 500, ceramic: 800, diamond: 1200 },
    chipLoad: {
      roughing: { flatEndmill: 0.008, ballEndmill: 0.005, drill: 0.004 },
      finishing: { flatEndmill: 0.004, ballEndmill: 0.003, drill: 0.002 }
    },
    specificCuttingForce: 250,
    machinabilityRating: 9,
    workHardening: 1.1,
    thermalConductivity: 167
  },
  {
    id: 'aluminum-7075',
    name: 'Aluminum 7075',
    category: 'Aluminum',
    sfm: { hss: 150, carbide: 400, ceramic: 700, diamond: 1000 },
    chipLoad: {
      roughing: { flatEndmill: 0.006, ballEndmill: 0.004, drill: 0.003 },
      finishing: { flatEndmill: 0.003, ballEndmill: 0.002, drill: 0.002 }
    },
    specificCuttingForce: 300,
    machinabilityRating: 8,
    workHardening: 1.2,
    thermalConductivity: 130
  },
  {
    id: 'aluminum-2024',
    name: 'Aluminum 2024',
    category: 'Aluminum',
    sfm: { hss: 180, carbide: 450, ceramic: 750, diamond: 1100 },
    chipLoad: {
      roughing: { flatEndmill: 0.007, ballEndmill: 0.004, drill: 0.003 },
      finishing: { flatEndmill: 0.003, ballEndmill: 0.002, drill: 0.002 }
    },
    specificCuttingForce: 280,
    machinabilityRating: 8,
    workHardening: 1.15,
    thermalConductivity: 121
  },

  // Steel Materials
  {
    id: 'mild-steel',
    name: 'Mild Steel',
    category: 'Steel',
    sfm: { hss: 80, carbide: 200, ceramic: 400, diamond: 600 },
    chipLoad: {
      roughing: { flatEndmill: 0.005, ballEndmill: 0.003, drill: 0.003 },
      finishing: { flatEndmill: 0.002, ballEndmill: 0.001, drill: 0.002 }
    },
    specificCuttingForce: 800,
    machinabilityRating: 6,
    workHardening: 1.3,
    thermalConductivity: 50
  },
  {
    id: 'stainless-304',
    name: 'Stainless Steel 304',
    category: 'Steel',
    sfm: { hss: 60, carbide: 150, ceramic: 300, diamond: 450 },
    chipLoad: {
      roughing: { flatEndmill: 0.004, ballEndmill: 0.002, drill: 0.002 },
      finishing: { flatEndmill: 0.002, ballEndmill: 0.001, drill: 0.001 }
    },
    specificCuttingForce: 1000,
    machinabilityRating: 4,
    workHardening: 1.8,
    thermalConductivity: 16
  },
  {
    id: 'stainless-316',
    name: 'Stainless Steel 316',
    category: 'Steel',
    sfm: { hss: 50, carbide: 120, ceramic: 250, diamond: 400 },
    chipLoad: {
      roughing: { flatEndmill: 0.003, ballEndmill: 0.002, drill: 0.002 },
      finishing: { flatEndmill: 0.002, ballEndmill: 0.001, drill: 0.001 }
    },
    specificCuttingForce: 1100,
    machinabilityRating: 3,
    workHardening: 2.0,
    thermalConductivity: 16
  },

  // Copper Alloys
  {
    id: 'brass',
    name: 'Brass',
    category: 'Copper Alloy',
    sfm: { hss: 200, carbide: 400, ceramic: 600, diamond: 800 },
    chipLoad: {
      roughing: { flatEndmill: 0.006, ballEndmill: 0.004, drill: 0.004 },
      finishing: { flatEndmill: 0.003, ballEndmill: 0.002, drill: 0.002 }
    },
    specificCuttingForce: 400,
    machinabilityRating: 8,
    workHardening: 1.1,
    thermalConductivity: 109
  },
  {
    id: 'copper',
    name: 'Copper',
    category: 'Copper Alloy',
    sfm: { hss: 150, carbide: 300, ceramic: 500, diamond: 700 },
    chipLoad: {
      roughing: { flatEndmill: 0.005, ballEndmill: 0.003, drill: 0.003 },
      finishing: { flatEndmill: 0.003, ballEndmill: 0.002, drill: 0.002 }
    },
    specificCuttingForce: 350,
    machinabilityRating: 7,
    workHardening: 1.2,
    thermalConductivity: 385
  }
]

// Helper function to get material by ID
export function getMaterialById(id: string): MaterialProperties | undefined {
  return materialsDatabase.find(material => material.id === id)
}

// Helper function to get all materials by category
export function getMaterialsByCategory(category: string): MaterialProperties[] {
  return materialsDatabase.filter(material => material.category === category)
}