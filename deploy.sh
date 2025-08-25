#!/bin/bash

# JustTheChips Deployment Script for Linux/macOS
# This script builds the application for production deployment

set -e  # Exit on any error

echo "🚀 JustTheChips Deployment Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ and try again."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version must be 18 or higher. Current version: $(node --version)"
    echo "   Please upgrade Node.js and try again."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Navigate to web directory and install dependencies
echo ""
echo "📦 Installing web dependencies..."
cd web
npm install --ignore-scripts

# Lint the code
echo ""
echo "🔍 Running code linter..."
npm run lint

# Build the application
echo ""
echo "🔨 Building application for production..."
npm run build

# Check if dist directory was created
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📁 Built files are in: web/dist/"
echo "📊 Build summary:"
echo "   - HTML: $(find dist -name "*.html" | wc -l) file(s)"
echo "   - CSS:  $(find dist -name "*.css" | wc -l) file(s)" 
echo "   - JS:   $(find dist -name "*.js" | wc -l) file(s)"

# Get total size
DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "unknown")
echo "   - Total size: $DIST_SIZE"

echo ""
echo "🌐 To preview the built application:"
echo "   npm run preview"
echo ""
echo "📤 To deploy to a web server:"
echo "   Upload the contents of web/dist/ to your web server"
echo ""
echo "🎉 Deployment build complete!"