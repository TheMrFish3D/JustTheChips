# Development Plan (living)

Note: Update this plan with every change. If something is under-implemented or needs improvement, add an item here and open a corresponding issue.

Order prioritizes project foundations (standards, testing) before features.

## 0. Project Scaffolding and Standards
- Task: Initialize React + TypeScript app with Vite
  - Steps:
    - Create Vite React-TS scaffold and repo wiring
    - Configure path aliases and src structure per architecture
    - Add basic page route placeholders
- Task: Coding standards and linting
  - Steps:
    - Add ESLint (typescript + react), Prettier, EditorConfig
    - Enforce import/order, no-floating-promises, eqeqeq, naming conventions
    - Add pre-commit lint-staged hook
- Task: Testing guidelines and harness
  - Steps:
    - Add Vitest + React Testing Library
    - Define test pyramid and coverage threshold
    - Create sample unit tests for utils

## 1. Core Data Schemas and Validation
- Task: Define TypeScript types and zod schemas for Material/Machine/Tool/Spindle/Inputs
  - Steps:
    - Create schema files, infer TS types, export validators
    - Write unit tests for schema validation (accept good, reject bad)
- Task: Seed example JSON datasets and loaders
  - Steps:
    - Add minimal curated entries for each domain
    - Implement loader utilities with zod-safe parse and helpful errors

## 2. Core Calculation Engine
- Task: Implement helpers (math, clamp, interpolate, units)
  - Steps:
    - Implement interpolation and clamping with tests
    - Add unit conversion helpers
- Task: Effective geometry and RPM
  - Steps:
    - Implement getEffectiveDiameter/Flutes and vc→rpm with clamping
    - Unit tests for each tool type
- Task: Chipload and feed limiting
  - Steps:
    - Implement fz base calc, chip thinning, vf computation
    - Apply machine axis limit; recompute fz; warnings
- Task: Engagement, MRR, and power with power-limit scaling
  - Steps:
    - Implement ae/ap limits, MRR, specific energy, tool/machine factors
    - Implement spindle losses, power available curve, scaling, warnings
- Task: Force and deflection (static + dynamic)
  - Steps:
    - Implement force; bending, shear, holder deflection; dynamic amplification
    - Threshold-based warnings
- Task: Validation and output assembly
  - Steps:
    - Implement validateInputs, chipload/deflection evaluators
    - Assemble final output per contract; rounding rules

## 3. UI Foundation
- Task: State management and calculator page shell
  - Steps:
    - Setup Zustand/Redux store for inputs and results
    - Wire calculate() on input change; debounce where needed
- Task: Selectors and inputs components
  - Steps:
    - Machine/Spindle/Tool/Material selectors
    - Numeric input with units and validation messages
- Task: Results and warnings display
  - Steps:
    - Cards for RPM, feed, chipload, power, force, deflection
    - Warning list with categories and recommendations

## 4. Advanced Features and Polishing
- Task: Charts and what-if analysis
  - Steps:
    - RPM vs power, deflection vs stickout graphs
    - Compute series with memoization
- Task: Import/Export settings
  - Steps:
    - JSON bundle export/import with schema validation
- Task: Dynamic deflection optimization
  - Steps:
    - Suggest diameter/stickout combos for target deflection

## 5. QA, Docs, and Release
- Task: End-to-end test scenarios
  - Steps:
    - Happy path scenarios for common materials and tools
    - Edge cases (small tool, power limit, chip thinning)
- Task: Documentation
  - Steps:
    - README project setup and usage
    - Docs on testing guidelines, coding standards, and contribution
- Task: Release v0.1
  - Steps:
    - Tag and generate changelog
    - Publish GitHub Pages build (optional)
