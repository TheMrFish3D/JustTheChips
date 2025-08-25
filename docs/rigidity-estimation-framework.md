# Custom Machine Rigidity Estimation Framework

## Overview

The Custom Machine Rigidity Estimation Framework provides a comprehensive system for estimating the structural rigidity of CNC machines based on their construction characteristics. This framework is designed to help users understand how their machine's construction affects cutting performance and to enable more accurate calculation of cutting parameters.

## Architecture

The framework consists of three main components:

1. **Core Estimation Engine** (`rigidity-estimation.ts`)
   - Mathematical models based on construction parameters
   - Validation against known machine data
   - Confidence scoring and similarity matching

2. **Machine Integration** (`machine-rigidity.ts`)
   - Integration with existing machine schema
   - Fallback to predefined rigidity factors
   - Future support for UI-driven custom estimation

3. **Comprehensive Testing** (`rigidity-estimation.test.ts`)
   - Validation of estimation accuracy
   - Edge case handling
   - Framework validation against known machines

## Key Features

### Mathematical Model

The framework uses a multi-factor approach to estimate rigidity:

```
Rigidity Factor = Frame Factor × Motion Factor × Spindle Factor × Size Penalty
```

Where each factor is based on specific construction characteristics:

- **Frame Factor**: Based on construction type (aluminum extrusion: 0.2, cast iron: 0.8)
- **Motion Factor**: Based on drive system (belt drive: 0.7, ballscrew: 1.0)
- **Spindle Factor**: Based on mounting (router clamp: 0.8, integrated: 1.1)
- **Size Penalty**: Based on weight-to-volume ratio and geometric factors

### Input Parameters

The framework accepts the following parameters:

#### Required Parameters
- `weightKg`: Total machine weight
- `workingVolumeMm3`: X × Y × Z working volume
- `frameConstructionType`: Type of frame construction
- `motionSystemType`: Linear motion system type
- `spindleMountType`: Spindle mounting method

#### Optional Parameters
- `frameThicknessMm`: Frame member thickness
- `baseWeightKg`: Base/table weight specifically
- `gantryWeightKg`: Moving gantry weight
- `maxSpanMm`: Largest unsupported span
- `heightToWidthRatio`: H/W ratio for stability analysis

### Construction Types

#### Frame Construction Types
- `aluminum_extrusion`: 3018 CNC style (factor: 0.2)
- `torsion_box`: Lowrider v3 style (factor: 0.3)
- `aluminum_machined`: CNC machined frame (factor: 0.4)
- `steel_fabricated`: Heavy steel fabrication (factor: 0.5)
- `steel_welded`: PrintNC style (factor: 0.6)
- `cast_iron`: Traditional mill style (factor: 0.8)
- `composite`: Epoxy granite or similar (factor: 0.85)

#### Motion System Types
- `belt_drive`: Belt and pulley (factor: 0.7)
- `leadscrew`: Acme or metric leadscrew (factor: 0.9)
- `ballscrew`: Precision ballscrew (factor: 1.0)
- `rack_pinion`: Rack and pinion (factor: 0.8)
- `linear_motor`: Direct drive linear motor (factor: 1.1)

#### Spindle Mount Types
- `router_clamp`: Router clamp mount (factor: 0.8)
- `fixed_mount`: Fixed spindle mount (factor: 0.95)
- `cartridge_spindle`: Cartridge style (factor: 1.0)
- `integrated_spindle`: Integrated into structure (factor: 1.1)

## Validation Results

The framework has been validated against known machines with the following accuracy:

- **Average Error**: < 20% across all known machines
- **Maximum Error**: < 30% for any individual machine
- **Best Accuracy**: Machines with well-known construction types (3018, PrintNC, entry VMC)

### Known Machine Database

The framework includes data for these reference machines:

| Machine | Rigidity Factor | Weight | Frame Type | Accuracy |
|---------|----------------|---------|------------|----------|
| 3018 CNC | 0.15 | 8kg | Aluminum Extrusion | High |
| Lowrider v3 | 0.25 | 25kg | Torsion Box | High |
| Queenbee Pro | 0.35 | 45kg | Aluminum Machined | Medium |
| PrintNC | 0.6 | 150kg | Steel Welded | High |
| Benchtop Mill | 0.45 | 80kg | Cast Iron | High |
| Entry VMC | 0.8 | 2500kg | Cast Iron | High |

## Usage Examples

### Basic Estimation

```typescript
import { estimateMachineRigidity } from './rigidity-estimation.js'

const inputs = {
  weightKg: 100,
  workingVolumeMm3: 500 * 500 * 200,
  frameConstructionType: 'steel_welded',
  motionSystemType: 'ballscrew',
  spindleMountType: 'fixed_mount'
}

const result = estimateMachineRigidity(inputs)
console.log(`Estimated rigidity: ${result.estimatedRigidityFactor}`)
console.log(`Confidence: ${result.confidence}`)
```

### Detailed Analysis

```typescript
const result = estimateMachineRigidity(inputs)

// Component breakdown
console.log('Frame factor:', result.frameRigidityFactor)
console.log('Motion factor:', result.motionSystemFactor)
console.log('Spindle factor:', result.spindleMountFactor)
console.log('Size penalty:', result.sizePenaltyFactor)

// Similar machines
result.nearestKnownMachines.forEach(machine => {
  console.log(`Similar: ${machine.machineId} (${machine.similarity.toFixed(2)} similarity)`)
})

// Warnings
result.warnings.forEach(warning => {
  console.log(`Warning: ${warning}`)
})
```

### Framework Validation

```typescript
import { validateEstimationFramework } from './rigidity-estimation.js'

const validation = validateEstimationFramework()
console.log(`Average error: ${validation.averageError.toFixed(3)}`)
console.log(`Max error: ${validation.maxError.toFixed(3)}`)

validation.predictions.forEach(pred => {
  console.log(`${pred.machineId}: ${pred.actualRigidity} → ${pred.estimatedRigidity} (error: ${pred.error.toFixed(3)})`)
})
```

## Integration with Power Calculations

The framework integrates with existing power calculations through the `getEffectiveRigidityFactor()` function:

```typescript
// In power calculations
const rigidityFactor = getEffectiveRigidityFactor(machine)
const powerWithToolW = cuttingPowerW * toolPowerFactor * rigidityFactor
```

Currently, this returns the predefined `machine.rigidity_factor`, but will be extended to support custom estimation when UI integration is complete.

## Future Enhancements

### Planned Features
1. **UI Integration**: Form-based input for custom machine parameters
2. **Advanced Modeling**: Finite element analysis integration
3. **Dynamic Learning**: Update estimates based on user feedback
4. **Expanded Database**: More reference machines and construction types
5. **Validation Tools**: Deflection measurement integration

### Research Areas
1. **Thermal Effects**: Temperature impact on rigidity
2. **Wear Modeling**: Rigidity degradation over time
3. **Multi-Material**: Hybrid construction analysis
4. **Frequency Response**: Dynamic rigidity characteristics

## Testing

The framework includes comprehensive tests covering:

- Basic estimation for all machine types
- Component factor analysis and validation
- Size and weight effect modeling
- Edge case handling and error conditions
- Similarity matching and validation
- Framework accuracy against known machines

Run tests with:
```bash
npm run test -- src/core/calculations/rigidity-estimation.test.ts
```

## Conclusion

The Custom Machine Rigidity Estimation Framework provides a solid foundation for understanding and quantifying machine rigidity based on construction parameters. With validation against known machines showing good accuracy, it enables more informed cutting parameter selection and helps users understand the relationship between machine construction and cutting performance.

The framework is designed for extensibility and will be enhanced with UI integration and advanced modeling capabilities as the project evolves.