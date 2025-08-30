#!/bin/bash
# Setup script for Voice Chat Application

echo "🚀 Setting up Voice Chat Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your OpenAI API key"
fi

# Build the Angular application
echo "🏗️  Building Angular application..."
npm run build:prod

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file and add your OpenAI API key"
echo "2. Run 'npm run server' to start the application"
echo "3. Open http://localhost:4001 in your browser"
echo ""
echo "🔧 Available commands:"
echo "  npm run server      - Start the production server"
echo "  npm run start:dev   - Start development mode with watch"
echo "  npm run build:prod  - Build for production"
