@echo off
REM Setup script for Voice Chat Application (Windows)

echo 🚀 Setting up Voice Chat Application...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file and add your OpenAI API key
)

REM Build the Angular application
echo 🏗️  Building Angular application...
npm run build:prod

echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Edit .env file and add your OpenAI API key
echo 2. Run 'npm run server' to start the application
echo 3. Open http://localhost:4001 in your browser
echo.
echo 🔧 Available commands:
echo   npm run server      - Start the production server
echo   npm run start:dev   - Start development mode with watch
echo   npm run build:prod  - Build for production
echo.
pause
