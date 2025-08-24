# JustTheChips - CNC Calculator Development Instructions

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information here is incomplete or found to be in error.**

## Project Overview
JustTheChips is a CNC machining calculator that provides spindle speeds, feed rates, power requirements, and tool deflection estimates. Built with Vite + React + TypeScript, it runs entirely client-side with no backend dependencies.

## Working Effectively

### Initial Setup and Dependencies
1. **Install root dependencies**: `npm install` (takes ~1-5 seconds)
2. **Navigate to web application**: `cd web/`
3. **Install web dependencies**: `npm install --ignore-scripts` (takes ~5-10 seconds, ignore husky script errors)

### Build and Development Commands
- **Development server**: `npm run dev` (starts on http://localhost:5174/, ready in ~1 second)
- **Build application**: `npm run build` (takes ~1-2 seconds, outputs to `dist/`)
- **Preview built app**: `npm run preview` (serves on http://localhost:4173/)
- **Run tests**: `npm run test` (currently no test files exist)
- **Lint code**: `npm run lint` (immediate, shows warnings/errors)
- **Fix lint issues**: `npm run lint -- --fix` (immediate, auto-fixes issues)

### Critical Timing and Timeout Guidelines
- **NEVER CANCEL** any build commands - set timeouts to 60+ seconds minimum
- Build commands complete in 1-2 seconds but may occasionally take longer
- Dev server startup: allow 30+ seconds timeout
- All commands are very fast in this project (under 5 seconds typical)

## Validation Scenarios

### Always Test After Making Changes
1. **Build verification**: Run `npm run build` to ensure no build errors
2. **Lint verification**: Run `npm run lint -- --fix` to fix style issues
3. **Manual testing**: Start dev server with `npm run dev` and test in browser:
   - Navigate to http://localhost:5174/ (or port shown in console)
   - Test Calculator page loads with "Inputs and results will appear here" message
   - Click Libraries link to verify navigation works
   - Verify Libraries page shows: Materials, Tools, Machines, Spindles list
   - Return to Calculator page to test full navigation flow
   - Open browser dev tools and verify no console errors

### End-to-End Validation Workflow
```bash
cd /home/runner/work/JustTheChips/JustTheChips/web
npm run lint -- --fix
npm run build
npm run dev
# Test in browser at http://localhost:5174/
# Navigate between Calculator and Libraries pages
# Verify functionality works as expected
```

## Project Structure and Navigation

### Key Directories and Files
- **`web/`**: Main React application (work here for UI changes)
- **`web/src/pages/`**: React page components (Calculator.tsx, Libraries.tsx)
- **`web/src/core/utils/`**: Core utilities (math.ts with clamp(), lerp() functions)
- **`web/src/core/`**: Future location for calculation logic and data schemas
- **`docs/`**: Project documentation and specifications
- **`.github/`**: GitHub Actions workflows and this instructions file

### Example File Structure
```
web/src/
├── core/
│   └── utils/
│       └── math.ts          # Mathematical utilities (clamp, lerp)
├── pages/
│   ├── Calculator.tsx       # Main calculator interface
│   └── Libraries.tsx        # Data libraries display
├── App.tsx                  # Main app component with routing
└── main.tsx                 # App entry point
```

### Important Files (DO NOT MODIFY)
- **`docs/initial-spec.md`**: Canonical requirements specification (read-only)
- **`docs/initial-architecture.md`**: Architecture guidelines
- **`docs/development-plan.md`**: Development roadmap (update as you work)

### Configuration Files
- **`web/package.json`**: Web app dependencies and scripts
- **`web/eslint.config.js`**: Linting rules and import ordering
- **`web/vite.config.ts`**: Vite build configuration
- **`web/vitest.config.ts`**: Test configuration
- **`playwright.config.js`**: End-to-end test configuration (root level)

## Development Workflow

### Before Making Changes
1. Read `docs/initial-spec.md` to understand requirements
2. Review `docs/development-plan.md` for current priorities
3. Always work in the `web/` directory for application code

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Import ordering enforced, React hooks rules applied
- **Prettier**: Automatic formatting on save
- **Import order**: External libraries first, then internal modules

### Testing Strategy
- **Unit tests**: Use Vitest (configured but no tests exist yet)
- **E2E tests**: Playwright configured in root directory
- **Manual testing**: Always test in browser after changes
- **CI validation**: GitHub Actions runs Playwright tests on PR

### Common Tasks

#### Adding New Calculation Logic
1. Create modules in `web/src/core/` following existing pattern
2. Use utilities from `web/src/core/utils/math.ts` (clamp, lerp functions available)
3. Follow the data-driven architecture from specs in `docs/initial-spec.md`
4. Add TypeScript interfaces for type safety
5. Export functions for use in UI components

Example:
```typescript
// web/src/core/calculations/speeds.ts
import { clamp } from '../utils/math.js'

export function calculateRPM(diameter: number, surfaceSpeed: number): number {
  const rpm = (surfaceSpeed * 1000) / (Math.PI * diameter)
  return clamp(rpm, 100, 24000) // Clamp to reasonable spindle limits
}
```

#### UI Component Development
1. Components in `web/src/pages/` or `web/src/components/`
2. Use React Router for navigation (already configured)
3. State management with Zustand (already installed)
4. Test navigation between Calculator and Libraries pages

#### Data Management
1. Materials, tools, machines data will be in `web/src/data/`
2. Use TypeScript interfaces for data schemas
3. Implement validation with zod (not yet added)

### Troubleshooting

#### Husky/Git Hooks Errors
- Use `npm install --ignore-scripts` to skip husky setup
- Git hooks may fail in sandboxed environments (expected)

#### Dev Server Port Conflicts
- Vite automatically finds next available port (5174, 5175, etc.)
- Check console output for actual port number

#### Build Failures
- Always run `npm run lint -- --fix` first
- Check for TypeScript errors in console
- Ensure all imports are properly typed

## Quality Assurance

### Pre-Commit Checklist
1. `npm run lint -- --fix` - Fix all linting issues
2. `npm run build` - Ensure clean build
3. Manual browser testing of changed functionality
4. Update `docs/development-plan.md` if adding new features

### CI/CD Pipeline
- **GitHub Actions**: Runs on every PR and push to main
- **Playwright tests**: End-to-end testing (requires browser install)
- **Timeout**: CI jobs have 60-minute timeout

## Project Context

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: CSS + React components
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Linting**: ESLint + Prettier
- **State**: Zustand for state management
- **Routing**: React Router DOM

### Architecture Principles
- **Client-side only**: No backend dependencies
- **Modular design**: Separate data, calculations, and UI
- **Type safety**: Full TypeScript coverage
- **Performance**: Fast builds and hot reload during development

This project is in early development stage. Most calculation logic and data schemas are not yet implemented. Focus on building the foundation according to the specifications in `docs/`.
