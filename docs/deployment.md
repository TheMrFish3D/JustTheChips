# Just the Chip - Deployment Guide

## Quick Start

### Development
```bash
cd web
npm install
npm run dev
```

### Production Build
```bash
./deploy.sh
```

### Deploy to GitHub Pages
1. Push to main branch
2. GitHub Actions will automatically build and deploy
3. Visit: https://themrfish3d.github.io/JustTheChips/

## Project Structure

```
JustTheChips/
├── web/                    # React/TypeScript application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── App.tsx         # Main application
│   │   └── main.tsx        # Entry point
│   ├── dist/               # Built files (generated)
│   └── package.json
├── .github/workflows/      # GitHub Actions
├── deploy.sh               # Deployment script
├── TODO.md                 # Development roadmap
└── README.md               # Project requirements

```

## Features Implemented

### ✅ Core UI Components
- Machine Configuration (spindle, motors, coolant)
- Tool Configuration (type, diameter, flutes, material, coating)
- Material Selection (wood, plastic, aluminum, steel, etc.)
- Operation Selection (slotting, pocketing, drilling, etc.)
- Parameters Table with export functionality

### ✅ Design Requirements
- Dark theme with light fonts
- Minimal visual design
- Simple layout for easy use
- Responsive grid layout

### ✅ Deployment
- GitHub Pages compatible
- Automated CI/CD pipeline
- Simple deployment script

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS (custom dark theme)
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## Development Notes

This is the initial implementation focusing on:
1. Simple, clean code structure
2. Easy GitHub Pages deployment
3. Basic UI components matching requirements
4. Extensible architecture for future enhancements

The calculation engine currently uses mock data. Real machining calculations need to be implemented according to the TODO.md roadmap.