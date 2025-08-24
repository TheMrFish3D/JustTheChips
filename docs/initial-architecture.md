# Initial Architecture Proposal

Scope: HTML/JavaScript/React single-page app implementing the JustTheChip CNC Calculator per the Initial Spec.

Goals
- Faithful implementation of formulas and outputs.
- Data-driven configuration with clear schemas.
- Decoupled core logic from UI for testability and reuse.
- Zero backend requirement initially; future API-ready.

App Architecture
- UI (React + Vite):
  - Pages: Calculator, Libraries (Materials/Tools/Machines/Spindles), Settings, About.
  - Components: Selectors, Numeric Inputs with units, Result Cards, Warning List, Charts (RPM vs Power, Deflection), Import/Export dialog.
  - State: React Query + Zustand (or Redux Toolkit). Inputs as a single source of truth; derived results memoized.
  - Routing: react-router.
- Core Calculation Engine (Pure JS/TS modules under src/core):
  - data/: domain JSON + loaders with validation (zod/TypeScript types).
  - calculations/: speeds-feeds, power, deflection, validation. All pure, side-effect free.
  - utils/: math, units, interpolation, clamping, rounding, warning builders.
  - index.ts: orchestrates calculate(inputs) -> result.
- Data Storage
  - Ship with curated JSON datasets for materials, tools, machines, spindles.
  - Local persistence via localStorage; import/export JSON bundles.
- Performance
  - All computation on client; avoid blocking UI with web workers for heavy cases.
  - Memoize computeGraph points for charts.
- Error/Warning System
  - Structured warnings with types and recommended actions.
  - Non-blocking; inputs validated with inline messages.
- Extensibility
  - New material/tool/machine entries as JSON files.
  - Pluggable power curves; interpolation function.

Data Schemas (TypeScript-ish)
- Material
  - id: string; category: string;
  - vc_range_m_min: [number, number];
  - fz_mm_per_tooth_by_diameter: Record<string, [number, number]>;
  - force_coeff_KN_mm2: number;
  - specific_cutting_energy_J_mm3: number;
  - chip_thinning: { enable_below_fraction: number; limit_factor: number };
  - max_engagement_fraction: number;
- Machine
  - id: string; axis_max_feed_mm_min: number;
  - rigidity_factor: number;
  - aggressiveness: { axial: number; radial: number; feed: number };
- Tool
  - id: string; type: 'endmill_flat'|'drill'|'vbit'|'facemill'|'boring'|'slitting';
  - diameter_mm: number; flutes: number; coating: string;
  - stickout_mm: number; material: 'carbide'|'HSS'|string;
  - default_doc_mm: number; default_woc_mm: number;
  - metadata?: { angle_deg?: number; body_diameter_mm?: number; }
- Spindle
  - id: string; rated_power_kW: number; rpm_min: number; rpm_max: number; base_rpm: number;
  - power_curve: Array<{ rpm: number; power_kW: number }>;
- Inputs
  - machineId, spindleId, toolId, materialId, cutType, aggressiveness, userDOC_mm?, userWOC_mm?, overrideFlutes?, overrideStickout_mm?
- Outputs per spec 3.3

Key Algorithms
- Effective geometry by tool type; z_eff adjustments.
- RPM calc with clamping; vc_actual.
- Chipload base + chip thinning; feed clamping; recompute fz.
- MRR by operation; power calc with tool/machine factors & losses; power limit scaling.
- Force from area × coeff; deflection (bending/shear/holder) + dynamic amplification.
- Validation rules and categorized warnings.

Tech Choices
- Vite + React + TypeScript.
- zod for runtime validation; ts for static types.
- Zustand (light) or Redux Toolkit (if team prefers) + React Query (if remote data later).
- Chart.js or Recharts for plots.
- ESLint + Prettier + Vitest for unit tests.

Edge Cases to handle
- ae -> 0 (avoid divide-by-zero in chip thinning; minimum ae epsilon).
- rpm at limits; vf at axis limit.
- Missing diameter bin for fz range; interpolate between nearest bins.
- Very small tools (<3 mm) with high force.
- Unknown materials/tools: show validation errors, don’t compute.

Success Criteria
- Given identical inputs, results match spec equations within rounding tolerance.
- All calculators work offline in modern browsers.
- 95%+ functions covered by unit tests in core calculations.
