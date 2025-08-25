# Deployment Scripts Documentation

This document provides detailed information about the cross-platform deployment scripts included with JustTheChips.

## Overview

JustTheChips includes three deployment scripts to simplify the build and deployment process across different operating systems:

- `deploy.sh` - For Linux and macOS (Bash)
- `deploy.bat` - For Windows (Command Prompt)  
- `deploy.ps1` - For Windows (PowerShell with enhanced features)

## Prerequisites

Before running any deployment script, ensure you have:

- **Node.js 18 or higher** installed
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

You can verify your installations:

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show npm version
```

## Script Details

### deploy.sh (Linux/macOS)

**Usage:**
```bash
./deploy.sh
```

**Features:**
- Automatic Node.js version checking (requires 18+)
- Color-coded output for better readability
- Detailed build summary with file counts and sizes
- Error handling with descriptive messages
- Exit on any error to prevent partial builds

**Permissions:**
The script is automatically made executable. If you encounter permission issues:
```bash
chmod +x deploy.sh
```

### deploy.bat (Windows Command Prompt)

**Usage:**
```cmd
deploy.bat
```

**Features:**
- Node.js version validation
- Windows-specific error handling
- Pause prompts for error review
- Detailed build output
- File count summaries

**Note:** The script will pause on errors, allowing you to read error messages before closing.

### deploy.ps1 (Windows PowerShell)

**Usage:**
```powershell
# Basic deployment
.\deploy.ps1

# Skip preview prompt
.\deploy.ps1 -SkipPreview

# Show help
.\deploy.ps1 -Help
```

**Features:**
- Advanced parameter support
- Enhanced error handling with try-catch blocks
- Color-coded output
- Optional preview server launch
- Detailed file size calculations
- Help documentation

**Parameters:**
- `-SkipPreview` - Skip the preview prompt after successful build
- `-Help` - Display help information and usage examples

**Execution Policy:**
If you encounter execution policy errors, you may need to allow script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Build Process

All scripts follow the same build process:

1. **Environment Validation**
   - Check Node.js installation and version (18+)
   - Verify npm availability

2. **Dependency Installation**
   - Install root project dependencies (`npm install`)
   - Install web application dependencies (`cd web && npm install --ignore-scripts`)

3. **Code Quality**
   - Run ESLint linting (`npm run lint`)
   - Ensure code meets quality standards

4. **Production Build**
   - Compile TypeScript (`tsc -b`)
   - Build with Vite (`vite build`)
   - Generate optimized production assets

5. **Build Verification**
   - Confirm `dist` directory creation
   - Report build statistics (file counts, sizes)

## Output

After successful deployment, you'll find the built application in:
```
web/dist/
├── index.html           # Main application entry point
├── assets/
│   ├── index-[hash].css # Compiled and minified CSS
│   └── index-[hash].js  # Compiled and minified JavaScript
└── [other assets]       # Images, fonts, etc.
```

## Deployment Options

### Local Preview

Test the built application locally:
```bash
cd web
npm run preview
```

This starts a local server at `http://localhost:4173`.

### Web Server Deployment

For production deployment:

1. Upload the entire contents of `web/dist/` to your web server's document root
2. Ensure your web server is configured to serve single-page applications (SPA)
3. Configure proper MIME types for `.js` and `.css` files

### Static Site Hosting

The application works with any static hosting service:
- **Netlify:** Drag and drop the `dist` folder
- **Vercel:** Connect your repository for automatic deployments  
- **GitHub Pages:** Use the included GitHub Actions workflow
- **Amazon S3:** Upload to an S3 bucket with static website hosting
- **CDN Services:** Upload to any CDN that supports SPAs

## Troubleshooting

### Common Issues

**Node.js Version Error:**
```
Error: Node.js version must be 18 or higher
```
**Solution:** Update Node.js from [nodejs.org](https://nodejs.org/)

**Permission Denied (Linux/macOS):**
```
Permission denied: ./deploy.sh
```
**Solution:** Make the script executable: `chmod +x deploy.sh`

**PowerShell Execution Policy Error:**
```
Execution of scripts is disabled on this system
```
**Solution:** Allow script execution: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**Build Failures:**
- Check that all dependencies are installed correctly
- Ensure you're in the correct directory
- Verify that TypeScript files compile without errors
- Check for linting errors that need to be fixed

### Getting Help

If you encounter issues:

1. Check the error messages for specific guidance
2. Ensure all prerequisites are met
3. Try deleting `node_modules` folders and running the script again
4. Review the [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
5. Open an issue on GitHub with your error details

## Integration with CI/CD

The deployment scripts can be integrated into CI/CD pipelines:

**GitHub Actions:**
```yaml
- name: Deploy Application
  run: ./deploy.sh
```

**Manual CI Integration:**
You can extract individual commands from the scripts for use in custom CI configurations.

## Contributing

When modifying deployment scripts:

1. Test on all supported platforms
2. Maintain consistent behavior across scripts
3. Update this documentation
4. Follow the existing error handling patterns
5. Ensure scripts are idempotent (safe to run multiple times)