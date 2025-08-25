# JustTheChips

A comprehensive CNC machining calculator that provides accurate spindle speeds, feed rates, power requirements, and tool deflection estimates for various machining operations.

## Features

- **Comprehensive calculations**: RPM, feed rates, chipload, cutting forces, power requirements, and tool deflection
- **Material library**: Extensive database of cutting parameters for different materials
- **Tool database**: Support for various tool types (endmills, drills, face mills, etc.)
- **Machine profiles**: Configurable machine and spindle specifications
- **Real-time warnings**: Intelligent alerts for power limits, deflection, and cutting parameters
- **Modern UI**: Built with React + TypeScript for a responsive, professional interface

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TheMrFish3D/JustTheChips.git
   cd JustTheChips
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd web && npm install --ignore-scripts
   ```

3. **Start development server**:
   ```bash
   cd web
   npm run dev
   ```

4. **Open your browser** to http://localhost:5174

### Building for Production

#### Quick Deployment (Recommended)

Use the provided deployment scripts for your platform:

**Linux/macOS:**
```bash
./deploy.sh
```

**Windows (Command Prompt):**
```cmd
deploy.bat
```

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

The deployment scripts will:
- Check Node.js and npm installation
- Install all dependencies
- Run code linting
- Build the application for production
- Provide deployment instructions

#### Manual Build

```bash
cd web
npm run build
npm run preview  # Preview the built application
```

## Deployment

JustTheChips includes cross-platform deployment scripts to simplify building and deploying the application.

### Deployment Scripts

| Platform | Script | Description |
|----------|--------|-------------|
| Linux/macOS | `./deploy.sh` | Bash script for Unix-like systems |
| Windows | `deploy.bat` | Batch script for Windows Command Prompt |
| Windows | `.\deploy.ps1` | PowerShell script with enhanced features |

### Prerequisites

- **Node.js 18+** and npm
- Git (for cloning the repository)

### Deployment Process

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TheMrFish3D/JustTheChips.git
   cd JustTheChips
   ```

2. **Run the deployment script for your platform**:
   
   **Linux/macOS:**
   ```bash
   ./deploy.sh
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   deploy.bat
   ```
   
   **Windows (PowerShell with optional preview):**
   ```powershell
   # Basic deployment
   .\deploy.ps1
   
   # Skip preview prompt
   .\deploy.ps1 -SkipPreview
   
   # Show help
   .\deploy.ps1 -Help
   ```

3. **Deploy the built files**:
   After successful build, upload the contents of `web/dist/` to your web server.

### What the Scripts Do

- ✅ Verify Node.js 18+ and npm installation
- 📦 Install root and web dependencies  
- 🔍 Run ESLint code quality checks
- 🔨 Build the application for production
- 📊 Display build summary and file counts
- 🌐 Provide preview and deployment instructions

### Manual Preview

After building, you can preview the application locally:

```bash
cd web
npm run preview
```

The preview server will start on `http://localhost:4173`.

## Usage

1. **Select your machine** and spindle configuration
2. **Choose your tool** from the database or add custom specifications  
3. **Select material** and cutting operation type
4. **Adjust cutting parameters** (depth of cut, width of cut, aggressiveness)
5. **Review calculated results** including RPM, feed rate, power requirements, and warnings

The calculator provides intelligent warnings for:
- Power limitations
- Excessive tool deflection  
- Chipload optimization
- Feed rate constraints

## Development

### Code Structure

```
web/src/
├── core/
│   ├── data/           # Material, tool, machine, and spindle databases
│   ├── calculations/   # Core calculation engine
│   └── utils/          # Mathematical utilities
├── pages/              # React page components
├── components/         # Reusable UI components
└── App.tsx            # Main application with routing
```

### Development Commands

```bash
cd web

# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality  
npm run lint            # Check code style
npm run lint -- --fix  # Fix auto-fixable issues
npm run test            # Run unit tests
npm run test:coverage   # Run tests with coverage

# End-to-end Testing
npx playwright test     # Run E2E tests
```

For detailed development guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Architecture Overview

The application follows a modular, data-driven architecture:

- **Data Layer** (`web/src/core/data/`): Material properties, tool specifications, machine configurations, and spindle parameters
- **Calculation Engine** (`web/src/core/calculations/`): Pure functions for speeds, feeds, power, deflection, and validation
- **UI Layer** (`web/src/`): React components for user interaction and results display
- **Utilities** (`web/src/core/utils/`): Mathematical helpers and shared constants

## Documentation

- **[Technical Specification](docs/initial-spec.md)** - Complete functional requirements and mathematical formulas
- **[Architecture Guide](docs/initial-architecture.md)** - Detailed system design and data schemas  
- **[Development Plan](docs/development-plan.md)** - Current roadmap and feature status
- **[Coding Standards](docs/coding-standards.md)** - Code style, linting rules, and best practices
- **[Testing Guidelines](docs/testing-guidelines.md)** - Testing strategy, patterns, and requirements
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: CSS + React components  
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Code Quality**: ESLint + Prettier + Husky pre-commit hooks
- **State Management**: Zustand
- **Routing**: React Router DOM

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development workflow
- Code standards and testing requirements  
- Pull request process
- Issue reporting guidelines

## License

This project is open source. Please check the repository for license details.

## Support

- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/TheMrFish3D/JustTheChips/issues)
- **Discussions**: Ask questions and share ideas in [GitHub Discussions](https://github.com/TheMrFish3D/JustTheChips/discussions)

---

Built with ❤️ for the CNC machining community.