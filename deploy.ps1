# JustTheChips Deployment Script for Windows PowerShell
# This script builds the application for production deployment

param(
    [switch]$SkipPreview,
    [switch]$Help
)

if ($Help) {
    Write-Host "JustTheChips Deployment Script" -ForegroundColor Cyan
    Write-Host "Usage: .\deploy.ps1 [-SkipPreview] [-Help]" -ForegroundColor Green
    Write-Host ""
    Write-Host "Parameters:" -ForegroundColor Yellow
    Write-Host "  -SkipPreview    Skip the preview prompt after building"
    Write-Host "  -Help          Show this help message"
    Write-Host ""
    Write-Host "This script will:"
    Write-Host "  1. Check Node.js and npm installation"
    Write-Host "  2. Install dependencies"
    Write-Host "  3. Run linting"
    Write-Host "  4. Build the application"
    Write-Host "  5. Provide deployment instructions"
    exit 0
}

Write-Host "🚀 JustTheChips Deployment Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    $nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajorVersion -lt 18) {
        Write-Host "❌ Error: Node.js version must be 18 or higher. Current version: $nodeVersion" -ForegroundColor Red
        Write-Host "   Please upgrade Node.js and try again." -ForegroundColor Red
        Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion detected" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: npm is not installed. Please install npm and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install root dependencies
Write-Host ""
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}
catch {
    Write-Host "❌ Error: Failed to install root dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate to web directory and install dependencies
Write-Host ""
Write-Host "📦 Installing web dependencies..." -ForegroundColor Yellow
try {
    Set-Location web
    npm install --ignore-scripts
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}
catch {
    Write-Host "❌ Error: Failed to install web dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Lint the code
Write-Host ""
Write-Host "🔍 Running code linter..." -ForegroundColor Yellow
try {
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "linting failed" }
}
catch {
    Write-Host "❌ Error: Linting failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Build the application
Write-Host ""
Write-Host "🔨 Building application for production..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "build failed" }
}
catch {
    Write-Host "❌ Error: Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dist directory was created
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: Build failed - dist directory not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Built files are in: web\dist\" -ForegroundColor Cyan
Write-Host "📊 Build summary:" -ForegroundColor Cyan

# Count files
$htmlFiles = (Get-ChildItem -Path "dist" -Filter "*.html" -ErrorAction SilentlyContinue).Count
$cssFiles = (Get-ChildItem -Path "dist\assets" -Filter "*.css" -ErrorAction SilentlyContinue).Count
$jsFiles = (Get-ChildItem -Path "dist\assets" -Filter "*.js" -ErrorAction SilentlyContinue).Count

Write-Host "   - HTML: $htmlFiles file(s)"
Write-Host "   - CSS:  $cssFiles file(s)"
Write-Host "   - JS:   $jsFiles file(s)"

# Get total size
try {
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
    $distSizeFormatted = if ($distSize -gt 1MB) { "{0:N2} MB" -f ($distSize / 1MB) } 
                        elseif ($distSize -gt 1KB) { "{0:N2} KB" -f ($distSize / 1KB) }
                        else { "$distSize bytes" }
    Write-Host "   - Total size: $distSizeFormatted"
}
catch {
    Write-Host "   - Total size: unknown"
}

Write-Host ""
Write-Host "🌐 To preview the built application:" -ForegroundColor Yellow
Write-Host "   npm run preview" -ForegroundColor White
Write-Host ""
Write-Host "📤 To deploy to a web server:" -ForegroundColor Yellow
Write-Host "   Upload the contents of web\dist\ to your web server" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Deployment build complete!" -ForegroundColor Green

if (-not $SkipPreview) {
    Write-Host ""
    $preview = Read-Host "Would you like to preview the application now? (y/N)"
    if ($preview -eq 'y' -or $preview -eq 'Y') {
        Write-Host "Starting preview server..." -ForegroundColor Yellow
        npm run preview
    }
}