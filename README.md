# JustTheChips — Software Specification for “JustTheChip” CNC Calculator
1. Purpose
Provide accurate spindle speeds, feed rates, power requirements, and tool deflection estimates for CNC machining operations across various materials, tools, machines, and cutting conditions.

2. High‑Level Architecture
Data layer (src/data/)

materials.js: material properties and cutting coefficients

machines.js: machine presets, motor types, drive systems

tools.js: tool geometries, coatings, and defaults

spindles.js: spindle power and RPM ranges

Calculation layer (src/calculations/)

speeds-feeds.js: core RPM, feed, chipload, force, and deflection logic

power.js: detailed power/torque/thermal analysis

deflection.js: static & dynamic tool deflection modeling and optimization

validation.js: input validation and warning generation

UI layer (src/components/) (abstracted in this spec): machine configuration, material/tool selectors, DOC input, results display.

Utility layer (src/utils/): constants, export/import helpers.

Entry point (src/app.js): orchestrates data loading, input handling, calculations, and UI updates.

3. Functional Requirements
3.1 Input & Configuration
Machine selection

Choose preset or custom machine.

Parameters: axis feed limits, rigidity factor K_rigidity, aggressiveness multipliers.

Spindle selection

Define rated_power_kW, rpm_min, rpm_max, base_rpm.

Tool selection

Specify type (e.g., endmill_flat, drill, vbit, facemill, boring, slitting).

Parameters: diameter_mm, flutes, coating, stickout_mm, material.

Material selection

Choose from validated database; each entry defines cutting-speed range vc_range, chipload ranges fz_mm_per_tooth_by_diameter, force coefficient force_coeff_KN_mm2, specific cutting energy specific_cutting_energy_J_mm3, chip-thinning settings, and max engagement fractions.

Cut parameters

Select cutType (slot, profile, adaptive, facing, drilling, boring).

Specify aggressiveness (default = 1.0).

Optional user depth of cut userDOC (axial).

Machine aggressiveness multipliers apply to radial, axial, and feed components.

3.2 Calculations
Effective Tool Geometry

getEffectiveDiameter() varies by tool type (e.g., V-bit uses trig with tip diameter and angle).

getEffectiveFlutes() adjusts flute count for facemills, slitting saws, boring bars.

Surface Speed & RPM

vc = midpoint of material vc_range × speedFactor(cutType) × aggressiveness.

rpm = (vc × 1000) / (π × D_eff); clamped within spindle rpm_min/rpm_max, with warning if limited.

Chipload

fz = midpoint of chipload range × aggressiveness × toolChiploadFactors[tool.type] × coatingFactor.

Chip thinning: if ae < D_eff × chip_thinning.enable_below_fraction, multiply fz by sqrt(D_eff/ae).

Feed Rate

vf = rpm × z_eff × fz.

If vf exceeds machine axis limits, clamp to min(max_feed) and recompute fz.

Material Removal Rate (MRR)

For drilling: MRR = (π × D_eff² / 4) × vf.

Otherwise: MRR = ae × ap × vf.

Cutting Power

specificEnergy from material data or fallback by category.

cuttingPower = (MRR_mm³/min × specificEnergy) / 60.

toolFactor via getToolPowerFactor().

Multiply by machine rigidity K_rigidity.

spindleLosses = cuttingPower × 0.15.

powerRequired = cuttingPower × toolFactor × K_rigidity + spindleLosses.

Compare with powerAvailable from getSpindlePowerAtRPM(rpm); if required > 0.9×available, scale feed & MRR by (available × 0.85)/required and warn “Power limited.”

Cutting Force

Area A = ae × fz.

Base force F = material.force_coeff_KN_mm2 × A × 1000.

Multiply by tool-type forceFactor (e.g., drill 1.5, facemill 0.6).

Deflection

bendingDeflection = (F × L³)/(3 × E × I) where I = πd⁴/64.

shearDeflection = (1.2 × F × L)/(G × A) with G = E/2.6, A = πd²/4.

holderDeflection = F × holderCompliance (default 0.002 mm/N).

Total deflection = bending + shear + holder.

Flag warnings: >0.05 mm (danger), >0.02 mm (warning).

Chipload Validation

min = 0.5 × fzRange[0]; if fz_adjusted < min → danger “Chipload too low.”

max = 1.5 × fzRange[1]; if fz_adjusted > max → warning “Chipload very high.”

Power & Torque Analysis (power.js)

netCuttingPower = baseCuttingPower × toolFactor × rigidityFactor / toolEfficiency.

spindleLosses calculated from rated power and RPM (baseLosses + rpmLosses).

totalMotorPower = totalSpindlePower / DRIVE_EFFICIENCY.

Torque: ω = rpm × 2π / 60, effectiveTorque = (power / ω) × getToolTorqueFactor().

Thermal effects: heat generation 0.85 × power, coolant factor, compare to tool thermal limit.

Dynamic Deflection (deflection.js)

Natural frequency via cantilever-beam model.

Frequency ratio = operatingFrequency / naturalFrequency.

Dynamic amplification rules: <0.7 → 1 + 0.1×ratio; >1.4 → 1/(ratio²); near resonance → 3 + 2×sin(π×ratio); multiply static deflection accordingly.

3.3 Output
Return object (rounded where noted):

{
  "rpm": <int>,
  "feed_mm_min": <int>,
  "fz_mm": <float>,           // adjusted chipload
  "fz_actual_mm": <float>,    // chipload before limits
  "ae_mm": <float>,           // radial engagement
  "ap_mm": <float>,           // axial engagement (DOC)
  "mrr_mm3_min": <float>,
  "power_W": <float>,
  "power_available_W": <float>,
  "force_N": <float>,
  "deflection_mm": <float>,
  "warnings": [ {type, message} ],
  "toolType": <string>,
  "effectiveDiameter": <float>,
  "user_doc_override": <bool>,
  "vc_m_min": <int>,          // actual surface speed (m/min)
  "sfm": <int>                // actual surface speed (ft/min)
}
3.4 Validation & Warnings
Input validation for machine, spindle, tool, material, and cut parameters; returns lists of errors and warnings.

Warning categories: power, deflection, feed, chipload, user DOC exceeding recommended max, small tool with high force, etc.

Recommendation strings generated when warnings occur (e.g., “Use shorter or larger diameter tool”).

3.5 Advanced Features
User-specified DOC override with limit checking against max_axial_per_pass_D.

Automatic multi-pass suggestions (not fully implemented in current code).

Settings export/import utility.

Dynamic deflection analysis and optimization for target deflection (suggest diameter & stickout combos).

4. Mathematical Constants & Units
Units: millimeters, minutes, Newtons, kilowatts, RPM, degrees, Joules/mm³.

Physical constants from utils/constants.js include Young’s modulus for carbide/HSS, drive efficiency, thermal constants, etc.

5. Non‑Functional Requirements
Modular ES6 code; each module can be imported independently.

Should execute in modern browsers (no build step required).

Default values provided for missing optional parameters to prevent runtime errors.

Warning system must never block calculations unless validation errors exist.

6. Deliverables for Recode
Retain data-driven architecture with separate modules for materials, tools, machines, spindles.

Provide same calculation outputs and warnings for compatibility.

Ensure formulas in Section 3.2 remain mathematically equivalent, though implementation language/architecture may change.

Maintain extensibility: adding new materials, tools, or machines should only require data updates.

This specification captures the existing logic, formulas, and functional requirements to guide a platform rewrite or use within an LLM-driven development workflow.

go in to way more detail
Copy
Below is a more detailed, LLM-ready specification of the “JustTheChip” CNC Calculator.
It expands on data structures, function signatures, numerical methods, unit conventions, and warning logic to facilitate a faithful port or rewrite.

Comprehensive Software Specification for “JustTheChip” CNC Calculator
1. Purpose and Scope
Goal: Compute spindle speeds, feed rates, power requirements, cutting forces, and tool deflection for various CNC machining operations.
Users: CNC operators, hobbyists, and engineers needing accurate machining parameters across many machines, tools, and materials.
Outputs: RPM, feed rate, chipload, force, power, deflection, warnings, and calculated engagement values.

2. Architectural Overview
src/
├── app.js                  # entry point
├── data/
│   ├── materials.js        # material property database
│   ├── machines.js         # machine presets
│   ├── tools.js            # tool library
│   └── spindles.js         # spindle data
├── calculations/
│   ├── speeds-feeds.js     # main calculation pipeline
│   ├── power.js            # power & torque analysis
│   ├── deflection.js       # static & dynamic deflection
│   └── validation.js       # input validation and warning helpers
├── components/             # UI components (abstracted here)
└── utils/
    ├── constants.js        # shared physical constants
    └── helpers.js          # unit conversions, general helpers
2.1 Data Layer
materials.js: array of material objects

{
  id: "6061_aluminum",
  category: "aluminum",
  vc_range_m_min: [250, 600],
  fz_mm_per_tooth_by_diameter: { "3": [0.01, 0.04], "6": [0.02, 0.08], ... },
  force_coeff_KN_mm2: 0.0012,
  specific_cutting_energy_J_mm3: 0.75,
  chip_thinning: { enable_below_fraction: 0.5, limit_factor: 2 },
  max_engagement_fraction: 0.6
}
machines.js: machine presets

{
  id: "tormach_1100",
  axis_max_feed_mm_min: 3000,
  rigidity_factor: 1.0,
  aggressiveness: { axial: 1.0, radial: 1.0, feed: 1.0 }
}
tools.js: tool profiles

{
  id: "endmill_6mm_4f",
  type: "endmill_flat",
  diameter_mm: 6,
  flutes: 4,
  coating: "uncoated",
  stickout_mm: 20,
  material: "carbide",
  default_doc_mm: 6,
  default_woc_mm: 3
}
spindles.js: spindle capabilities

{
  id: "2.2kW_spindle",
  rated_power_kW: 2.2,
  rpm_min: 6000,
  rpm_max: 24000,
  base_rpm: 10000,
  power_curve: [
    { rpm: 6000, power_kW: 1.1 },
    { rpm: 12000, power_kW: 2.2 },
    { rpm: 24000, power_kW: 2.0 }
  ]
}
2.2 Calculation Layer
speeds-feeds.js

calculate(inputs) → returns detailed result object

Chains all sub-calculations: geometry, surface speed, rpm, chipload, feed, power, force, deflection, validation.

power.js

getSpindlePowerAtRPM(spindle, rpm)

computePower(MRR_mm3_min, material, tool, machine, rpm) → power, warnings

Includes thermal and torque analysis.

deflection.js

computeDeflection(tool, force_N) → static deflection

applyDynamicAmplification(tool, rpm, staticDeflection_mm) → adjusted deflection and warnings.

validation.js

validateInputs(inputs) → { errors: [], warnings: [] }

evaluateChipload(fz_actual, fz_range) → warnings

evaluateDeflection(deflection_mm) → warnings.

2.3 Utility Layer
constants.js

Material modulus, drive efficiency (default 0.95), holder compliance (0.002 mm/N), etc.

helpers.js

Unit conversions, interpolation, clamping, rounding.

2.4 UI Layer (Abstracted)
Components handle user selection, parameter input, and display of results/warnings.

3. Functional Requirements
3.1 Inputs
For each calculation request:

{
  "machineId": "string",
  "spindleId": "string",
  "toolId": "string",
  "materialId": "string",
  "cutType": "slot | profile | adaptive | facing | drilling | boring",
  "aggressiveness": number,          // 0–2 typical
  "userDOC_mm": number | null,       // axial depth of cut
  "userWOC_mm": number | null,       // radial width of cut (ae)
  "overrideFlutes": int | null,
  "overrideStickout_mm": number | null
}
3.2 Calculation Steps
3.2.1 Effective Tool Geometry
D_eff:

endmill_flat, drill: diameter_mm

vbit: tipDiameter + 2 * tan(angle/2) * doc

facemill: body_diameter

slitting: disk_diameter

boring: 2 * (offset + bit_diameter/2)

z_eff:

endmills/drills: flutes (optional reduction for facemill, slitting)

boring: 1.

3.2.2 Surface Speed & RPM
vc_target = average(material.vc_range) × speedFactor(cutType) × aggressiveness.

rpm_theoretical = (vc_target × 1000) / (π × D_eff).

Clamp to [spindle.rpm_min, spindle.rpm_max].

If clamped: push warning spindle speed limited.

vc_actual = rpm × π × D_eff / 1000.

3.2.3 Chipload
fz_base = avg(material.fz_mm_per_tooth_by_diameter[D_eff_rounded]) × aggressiveness × tool-type multiplier × coating multiplier.

Apply chip thinning if ae < D_eff × chip_thinning.enable_below_fraction:
fz_adjusted = fz_base × sqrt(D_eff / ae) clamped by chip_thinning.limit_factor.

Compute vf_theoretical = rpm × z_eff × fz_adjusted.

If vf_theoretical > machine.axis_max_feed_mm_min:

Clamp vf to machine limit

Recompute fz_adjusted = vf / (rpm × z_eff)

Warning feed limited.

3.2.4 Engagement & MRR
ap = userDOC_mm or tool default; limit by material max_engagement_fraction × D_eff.

ae = userWOC_mm or tool default; same limiting rule.

MRR

Drilling: π(D_eff²/4) × vf

Others: ae × ap × vf.

3.2.5 Cutting Power
specificEnergy = material-specific or category fallback.

cuttingPower = (MRR × specificEnergy) / 60 (W).

toolPowerFactor from tool type (e.g., drill 1.3, facemill 0.8).

powerWithTool = cuttingPower × toolPowerFactor × machine.rigidity_factor.

spindleLosses = powerWithTool × 0.15.

totalPowerRequired = powerWithTool + spindleLosses.

powerAvailable = getSpindlePowerAtRPM(spindle, rpm).

If totalPowerRequired > 0.9 × powerAvailable:

scale vf & MRR by (powerAvailable × 0.85)/totalPowerRequired.

recompute fz_adjusted.

warning power limited.

3.2.6 Cutting Force
Chip cross-section: A = ae × fz_adjusted (mm²).

Base force: F = material.force_coeff_KN_mm2 × A × 1000 (N).

Multiply by tool-type force multipliers (drill 1.5, facemill 0.6, etc.).

3.2.7 Tool Deflection
Geometry constants:

L = stickout_mm

E = modulus (carbide 600 GPa, HSS 210 GPa)

I = π d⁴ / 64

A = π d² / 4

G = E / 2.6

bending = (F × L³) / (3 × E × I)

shear = (1.2 × F × L) / (G × A)

holder = F × holder_compliance (default 0.002 mm/N)

staticDeflection = bending + shear + holder.

Dynamic amplification:

naturalFreq = (1/(2π)) × sqrt(3EI/(mL³)) (m derived from tool & holder mass).

operatingFreq = rpm / 60 × z_eff.

ratio = operatingFreq/naturalFreq.

Amplification factor G(ratio) rules:

ratio < 0.7: 1 + 0.1 × ratio

0.7 ≤ ratio ≤ 1.3: 3 + 2 × sin(π × ratio)

ratio > 1.3: 1 / (ratio²)

dynamicDeflection = staticDeflection × G(ratio).

3.2.8 Validation & Warnings
evaluateChipload(fz_adjusted, range)

Danger if < 0.5 × range.min, Warning if > 1.5 × range.max.

Deflection warnings:

Danger if dynamicDeflection > 0.05 mm

Warning if > 0.02 mm.

DOC/WOC checks against max_engagement_fraction × D_eff.

Power and feed warnings added earlier.

Small-diameter/high-force check: if D_eff < 3 mm && F > 100 N → warning.

3.3 Output
{
  "rpm": int,
  "vc_m_min": int,           // actual surface speed
  "sfm": int,                // ft/min
  "feed_mm_min": int,
  "fz_mm": float,            // chipload after limits
  "fz_actual_mm": float,     // chipload before feed & power limits
  "ae_mm": float,
  "ap_mm": float,
  "mrr_mm3_min": float,
  "power_W": float,
  "power_available_W": float,
  "force_N": float,
  "deflection_mm": float,    // dynamic deflection
  "toolType": string,
  "effectiveDiameter": float,
  "user_doc_override": bool,
  "warnings": [ { "type": string, "message": string } ]
}
4. Mathematical and Physical Constants
Symbol	Meaning	Default
π	Pi	3.14159
E	Young’s modulus	600 GPa (carbide), 210 GPa (HSS)
G	Shear modulus	E / 2.6
holder_compliance	Deflection per N	0.002 mm/N
drive_efficiency	Motor efficiency	0.95
thermal_factor	Heat generation fraction	0.85
All primary units: millimeters, minutes, Newtons, Watts, degrees.

5. Non‑Functional Requirements
ES6 modular design; pure functions where possible for LLM clarity.

Data-driven configuration: adding new materials/tools/machines requires data file edits only.

UI decoupled from calculation logic.

Warning system must be non-blocking unless validation errors exist.

Default values protect against undefined properties.

6. Recode Guidelines
Maintain API contracts and output schema from Section 3.3.

Preserve all formulas and physical models verbatim.

Keep data separation by domain (materials, tools, etc.).

Implement comprehensive unit tests for each calculation step.

Ensure deterministic results given identical inputs.

This detailed specification captures the logic, mathematical derivations, data schemas, and warning mechanisms of the existing “JustTheChip” system, allowing an LLM or developer to reproduce or port the application precisely.

---

Project docs
- Canonical spec: see docs/initial-spec.md (read-only)
- Architecture: see docs/initial-architecture.md
- Development plan: see docs/development-plan.md
- Copilot instructions: .github/COPILOT_INSTRUCTIONS.md