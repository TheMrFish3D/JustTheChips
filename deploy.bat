@echo off
REM JustTheChips Deployment Script for Windows
REM This script builds the application for production deployment

setlocal EnableDelayedExpansion

echo 🚀 JustTheChips Deployment Script
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed. Please install Node.js 18+ and try again.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Get Node.js version and check if it's 18+
for /f "tokens=1 delims=v" %%a in ('node --version') do set NODE_VERSION=%%a
for /f "tokens=1 delims=." %%a in ("%NODE_VERSION%") do set NODE_MAJOR=%%a
if %NODE_MAJOR% lss 18 (
    echo ❌ Error: Node.js version must be 18 or higher. Current version: %NODE_VERSION%
    echo    Please upgrade Node.js and try again.
    pause
    exit /b 1
)

for /f %%a in ('node --version') do echo ✅ Node.js %%a detected

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

for /f %%a in ('npm --version') do echo ✅ npm %%a detected

REM Install root dependencies
echo.
echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install root dependencies
    pause
    exit /b 1
)

REM Navigate to web directory and install dependencies
echo.
echo 📦 Installing web dependencies...
cd web
call npm install --ignore-scripts
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install web dependencies
    pause
    exit /b 1
)

REM Lint the code
echo.
echo 🔍 Running code linter...
call npm run lint
if %errorlevel% neq 0 (
    echo ❌ Error: Linting failed
    pause
    exit /b 1
)

REM Build the application
echo.
echo 🔨 Building application for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error: Build failed
    pause
    exit /b 1
)

REM Check if dist directory was created
if not exist "dist" (
    echo ❌ Error: Build failed - dist directory not found
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.
echo 📁 Built files are in: web\dist\
echo 📊 Build summary:
for /f %%a in ('dir /b dist\*.html 2^>nul ^| find /c /v ""') do echo    - HTML: %%a file(s)
for /f %%a in ('dir /b dist\assets\*.css 2^>nul ^| find /c /v ""') do echo    - CSS:  %%a file(s)
for /f %%a in ('dir /b dist\assets\*.js 2^>nul ^| find /c /v ""') do echo    - JS:   %%a file(s)

echo.
echo 🌐 To preview the built application:
echo    npm run preview
echo.
echo 📤 To deploy to a web server:
echo    Upload the contents of web\dist\ to your web server
echo.
echo 🎉 Deployment build complete!
echo.
pause