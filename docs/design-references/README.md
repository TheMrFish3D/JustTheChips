# Design Reference Images

This directory contains reference images from the visual overhaul issue #48 that show the target design layout.

## Target Layout Images

### Main Calculator Interface
- **Source:** Issue #48 - https://github.com/user-attachments/assets/fc783fbd-8c2c-43d5-b92d-8ccefe62365c
- **Shows:** Complete calculator interface with:
  - Left sidebar: Machine Setup, Tool Setup, Material sections
  - Main area: Tabbed "Cutting Parameters" (Basic, Advanced, Locked Values)
  - Results area: Calculated Parameters with educational explanations
  - Bottom sections: Detailed Analysis, Time Estimation, Chip Evacuation Analysis

### Machine Configuration Modal
- **Source:** Issue #48 - https://github.com/user-attachments/assets/caccb6e0-84f2-4faa-a56e-fd072cd11d9f
- **Shows:** Machine Configuration popup with:
  - X, Y, Z axis configuration sections
  - Motor Type, # Motors, Drive Type, Pitch dropdowns
  - Gear Reduction inputs
  - Machine Rigidity Estimate dropdown
  - Save Configuration button

### Hobby Machine Types
- **Source:** Issue #48 - https://github.com/user-attachments/assets/ec8844ce-707f-4496-afc7-fb656b3ec3b0
- **Shows:** Machine Type dropdown with hobby machines:
  - 3018 CNC
  - Lowrider v3
  - Queenbee Pro
  - PrintNC
  - Benchtop Mill
  - Rigid Hobby Mill
  - Entry VMC
  - Custom

### Hobby Spindle Types
- **Source:** Issue #48 - https://github.com/user-attachments/assets/234be979-0f70-4dd9-8441-8144825db5e4
- **Shows:** Spindle dropdown with hobby spindles:
  - Dewalt Router (1.25HP)
  - Makita Router (1.25HP)
  - VFD Spindle 0.8kW
  - VFD Spindle 1.5kW
  - VFD Spindle 2.2kW
  - VFD Spindle 3.2kW

## Key Design Principles

1. **Educational Focus:** Extensive tooltips and "Why these parameters?" explanations
2. **Tabbed Interface:** Replace navigation with tabs within the calculator
3. **Modal Configuration:** Detailed machine setup in popup modals
4. **Hobby Machine Focus:** Machine and spindle lists focused on hobby/entry-level equipment
5. **Visual Hierarchy:** Clear separation between input, calculation, and analysis sections
6. **Progressive Disclosure:** Basic/Advanced/Locked Values tabs for complexity management

## Implementation Notes

- Direct to calculator interface (no landing page)
- Maintain existing calculation engine and data structure
- Add educational tooltips throughout interface
- Implement modal system for machine configuration
- Update machine/spindle datasets for hobby focus
- Preserve export/import functionality