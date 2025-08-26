# Machine Descriptions and Usage Guidelines

## Lowrider v3 CNC Variants

Based on the rigidity analysis research, the Lowrider v3 configurations are organized by table size to provide accurate cutting parameter recommendations.

### Lowrider v3 Small (lowrider_v3_small)
- **Table Size:** ≤800mm maximum dimension (e.g., 600x600mm, 800x600mm)
- **Rigidity Factor:** 0.35
- **Best For:** 
  - Precision work requiring better surface finish
  - Light aluminum machining
  - Dense hardwoods
  - Small parts production
- **Construction Notes:** 
  - Benefits from shorter beam spans
  - Higher relative rigidity due to compact size
  - Suitable for precision spindle mounts

### Lowrider v3 Medium (lowrider_v3_medium)  
- **Table Size:** 800-1500mm maximum dimension (e.g., 1200x800mm, 1000x1000mm)
- **Rigidity Factor:** 0.25
- **Best For:**
  - General purpose CNC work
  - Softwood and plywood cutting
  - Light aluminum with conservative parameters
  - Educational and hobby projects
- **Construction Notes:**
  - Most common configuration
  - Good balance of work area and rigidity
  - Standard router mount acceptable

### Lowrider v3 Large (lowrider_v3_large)
- **Table Size:** 1500-2500mm maximum dimension (e.g., 2400x1200mm, 2000x1000mm)
- **Rigidity Factor:** 0.20  
- **Best For:**
  - Large format wood cutting
  - Sign making and architectural elements
  - Foam and soft material machining
  - Sheet goods processing
- **Construction Notes:**
  - Requires careful table construction
  - Longer beam spans reduce rigidity
  - Conservative cutting parameters essential

### Lowrider v3 Extra Large (lowrider_v3_xlarge)
- **Table Size:** >2500mm maximum dimension (e.g., 3000x1500mm, 4000x2000mm)
- **Rigidity Factor:** 0.15
- **Best For:**
  - Very large format wood cutting
  - Foam cutting for large models/prototypes
  - Basic 2D cutting operations only
  - Specialty applications requiring large work area
- **Construction Notes:**
  - Maximum practical size for design
  - Significant table deflection possible
  - Very conservative cutting only
  - Consider structural reinforcement

## General Lowrider v3 Guidelines

### Construction Quality Impact
All rigidity factors assume standard construction quality. Actual performance may vary:
- **Precision Build:** +20% rigidity (professional assembly, reinforced table)
- **Standard Build:** Baseline values (typical hobbyist construction)
- **Budget Build:** -25% rigidity (minimal reinforcement, basic materials)

### Material Recommendations by Size
- **Small/Medium:** Can handle aluminum with proper tooling and conservative parameters
- **Large:** Primarily wood, plastic, and soft materials
- **Extra Large:** Wood and foam only, avoid metals

### Spindle Mount Considerations
- **Router Mount:** Standard for most applications, moderate compliance
- **Precision Spindle:** Improves rigidity ~10%, recommended for aluminum work
- **Light Duty:** For non-cutting applications (laser, pen, etc.)

## Selection Guidelines

Choose the appropriate Lowrider v3 variant based on:
1. **Physical table size** you plan to build
2. **Materials** you intend to machine
3. **Precision requirements** for your projects
4. **Construction skill/budget** level

For most users, the medium variant provides the best balance of capability and work area.