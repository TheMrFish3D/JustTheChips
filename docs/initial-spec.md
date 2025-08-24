# Initial Spec: “JustTheChip” CNC Calculator

Note: This file is the canonical copy of the product and engineering specification captured from README at project start. Do not modify this file except to fix typos with a dedicated “typo fix” commit. Any scope or requirement change must go in a new document (e.g., RFC) and be referenced from the architecture/dev plan.

---

1. Purpose
Provide accurate spindle speeds, feed rates, power requirements, and tool deflection estimates for CNC machining operations across various materials, tools, machines, and cutting conditions.

2. High‑Level Architecture
- Data layer (src/data/)
  - materials.js: material properties and cutting coefficients
  - machines.js: machine presets, motor types, drive systems
  - tools.js: tool geometries, coatings, and defaults
  - spindles.js: spindle power and RPM ranges
- Calculation layer (src/calculations/)
  - speeds-feeds.js: core RPM, feed, chipload, force, and deflection logic
  - power.js: detailed power/torque/thermal analysis
  - deflection.js: static & dynamic tool deflection modeling and optimization
  - validation.js: input validation and warning generation
- UI layer (src/components/) (abstracted in this spec): machine configuration, material/tool selectors, DOC input, results display.
- Utility layer (src/utils/): constants, export/import helpers.
- Entry point (src/app.js): orchestrates data loading, input handling, calculations, and UI updates.

3. Functional Requirements
3.1 Input & Configuration
- Machine selection: choose preset or custom machine. Parameters: axis feed limits, rigidity factor K_rigidity, aggressiveness multipliers.
- Spindle selection: rated_power_kW, rpm_min, rpm_max, base_rpm.
- Tool selection: type (endmill_flat, drill, vbit, facemill, boring, slitting). Params: diameter_mm, flutes, coating, stickout_mm, material.
- Material selection: database with vc_range, fz ranges by diameter, force_coeff_KN_mm2, specific_cutting_energy_J_mm3, chip-thinning settings, max engagement fractions.
- Cut parameters: cutType (slot, profile, adaptive, facing, drilling, boring), aggressiveness (default 1.0), optional userDOC (axial). Machine aggressiveness multipliers apply to radial, axial, and feed.

3.2 Calculations
- Effective Tool Geometry: getEffectiveDiameter() varies by tool; getEffectiveFlutes() adjusts for facemills, slitting, boring.
- Surface Speed & RPM: vc = mid(vc_range) × speedFactor(cutType) × aggressiveness. rpm = (vc × 1000) / (π × D_eff); clamp to spindle range with warning.
- Chipload: fz = mid(fz_range) × aggressiveness × toolChiploadFactors[tool.type] × coatingFactor. Chip thinning if ae < D_eff × threshold: fz *= sqrt(D_eff/ae).
- Feed Rate: vf = rpm × z_eff × fz; clamp to machine axis max and recompute fz if necessary.
- MRR: drilling π D_eff²/4 × vf; others ae × ap × vf.
- Cutting Power: specificEnergy from material or fallback; cuttingPower = (MRR × specificEnergy)/60. Multiply by toolFactor and K_rigidity; add spindleLosses = 0.15×cuttingPower. Compare against power available at RPM; scale vf & MRR if power-limited; warn.
- Cutting Force: A = ae × fz; F = material.force_coeff_KN_mm2 × A × 1000; apply tool-type factor.
- Deflection: bending = (F L³)/(3 E I), shear = (1.2 F L)/(G A), holder = F × holderCompliance (0.002 mm/N). Total = sum. Warnings >0.02 mm (warn) and >0.05 mm (danger).
- Chipload Validation: danger if fz_adjusted < 0.5×min, warn if > 1.5×max.
- Power & Torque Analysis: includes netCuttingPower, spindle losses from rated power & RPM, motor power via drive efficiency, torque ω = rpm×2π/60, thermal effects (0.85×power) and coolant factor.
- Dynamic Deflection: natural frequency from cantilever model; amplification vs frequency ratio rules; multiply static deflection.

3.3 Output
Return object keys: rpm, feed_mm_min, fz_mm, fz_actual_mm, ae_mm, ap_mm, mrr_mm3_min, power_W, power_available_W, force_N, deflection_mm, warnings[{type,message}], toolType, effectiveDiameter, user_doc_override, vc_m_min, sfm.

3.4 Validation & Warnings
- Validate inputs for machine, spindle, tool, material, and cut parameters; collect errors/warnings.
- Warning categories: power, deflection, feed, chipload, user DOC too high, small tool/high force, etc. Recommendations accompany warnings when applicable.

3.5 Advanced Features
- User DOC override with limit check vs max_axial_per_pass_D.
- Automatic multi-pass suggestions (partial).
- Settings export/import.
- Dynamic deflection optimization (suggest diameter/stickout combos).

4. Constants & Units
- Units: mm, min, N, kW, RPM, degrees, J/mm³.
- Constants: Young’s modulus for carbide/HSS, drive efficiency, thermal constants, etc.

5. Non‑Functional Requirements
- Modular ES6 modules; browser-executable without build step.
- Defaults for optional params to prevent runtime errors.
- Warning system must not block calculation unless validation errors exist.

6. Deliverables for Recode
- Keep data-driven architecture per domain.
- Match outputs and warnings for compatibility.
- Preserve formulas in 3.2.
- Extensible: new materials/tools/machines via data updates only.

7. Detailed, LLM-ready spec (verbatim from README continuation)
- Expanded architectural map and module responsibilities.
- Detailed data schemas for materials, machines, tools, spindles.
- Function signatures: calculate(), getSpindlePowerAtRPM(), computePower(), computeDeflection(), applyDynamicAmplification(), validateInputs(), evaluateChipload(), evaluateDeflection().
- Detailed algorithms for RPM, chipload, feed, MRR, power, force, static/dynamic deflection, and warnings.
- Constants table and unit conventions.
- Recode guidelines and testing requirements.
