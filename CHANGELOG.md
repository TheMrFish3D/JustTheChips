# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-19

### Added

#### Core Calculation Engine
- **Comprehensive CNC calculations**: RPM, feed rates, chipload, cutting forces, power requirements, and tool deflection
- **Material library**: Aluminum 6061, Carbon Steel 1045, Stainless Steel 316 with cutting parameters
- **Tool database**: Support for endmills, drills, face mills, and V-bits with geometric specifications
- **Machine profiles**: Configurable machine and spindle specifications (Haas VF2, Tormach 1100MX, Makino V33i)
- **Spindle library**: Multiple spindle configurations (0.8kW high-speed, 2.2kW, 7.5kW)
- **Cut type support**: Slot, Profile, Adaptive, Facing, Drilling, and Boring operations
- **Aggressiveness control**: Adjustable cutting parameter scaling (0.1x to 3x)

#### Advanced Features
- **Real-time warnings**: Intelligent alerts for power limits, deflection, and cutting parameters
- **Tool deflection optimization**: Find optimal tool configurations for target deflection levels
- **What-if analysis charts**: Performance visualization and parameter exploration
- **Import/Export functionality**: JSON-based configuration sharing with schema validation
- **Dynamic calculations**: Real-time parameter updates with comprehensive validation

#### User Interface
- **Modern React UI**: Built with React 19 + TypeScript + Vite for responsive performance
- **Intuitive navigation**: Calculator, Libraries, Settings, and About pages
- **Dropdown selectors**: Easy selection of machines, spindles, tools, and materials
- **Results display**: Clear presentation of calculated parameters and warnings
- **Libraries view**: Browse available materials, tools, machines, and spindles

#### Developer Experience
- **Comprehensive testing**: 396 unit and integration tests with high coverage
- **TypeScript throughout**: Full type safety across data schemas and calculations
- **Code quality tools**: ESLint, Prettier, and pre-commit hooks
- **Documentation**: Complete technical specs, architecture guides, and contribution guidelines
- **Development tooling**: Hot reload, build optimization, and end-to-end testing with Playwright

#### Data and Validation
- **Zod schema validation**: Type-safe data parsing and validation throughout
- **Comprehensive data models**: Structured schemas for materials, tools, machines, and inputs
- **Error handling**: Graceful error recovery with helpful error messages
- **Data loaders**: Robust JSON data loading with validation and fallbacks

### Technical Highlights
- **Zero backend dependencies**: Runs entirely client-side for easy deployment
- **Modular architecture**: Clean separation of data, calculations, and UI layers
- **Mathematical precision**: Accurate engineering calculations with proper unit handling
- **Performance optimized**: Efficient calculations with memoization and debouncing
- **Extensible design**: Easy to add new materials, tools, and calculation methods

### Initial Release Features Complete
This v0.1 release represents a fully functional CNC machining calculator with professional-grade calculations, comprehensive data libraries, and a modern user interface. All core functionality has been implemented and thoroughly tested.

[0.1.0]: https://github.com/TheMrFish3D/JustTheChips/releases/tag/v0.1.0