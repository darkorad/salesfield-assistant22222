
#!/bin/bash

# Make this script executable with: chmod +x setup-android.sh

# Color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== ŽIR-MD Android Setup Helper ====${NC}"
echo ""

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed or not in PATH${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed or not in PATH${NC}"
    echo "npm should be included with your Node.js installation."
    exit 1
fi

# Environment information
echo -e "${YELLOW}Environment Information:${NC}"
echo -e "Node version: $(node -v || echo 'Not found')"
echo -e "NPM version: $(npm -v || echo 'Not found')"
echo -e "Working directory: $(pwd)"
echo ""

# Check for package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found${NC}"
    echo "Make sure you're in the correct project directory."
    exit 1
fi

# Ensure vite is installed locally
echo -e "${YELLOW}Checking for vite...${NC}"
if [ ! -d "node_modules/vite" ]; then
    echo -e "${YELLOW}Vite not found in node_modules, installing dependencies...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}npm install failed. Trying with --legacy-peer-deps...${NC}"
        npm install --legacy-peer-deps
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to install dependencies. Please check the error messages above.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${GREEN}Vite is installed.${NC}"
fi

# Check if Capacitor is installed
echo -e "${YELLOW}Checking for Capacitor...${NC}"
if [ ! -d "node_modules/@capacitor/core" ] || [ ! -d "node_modules/@capacitor/cli" ]; then
    echo -e "${YELLOW}Capacitor not found, installing...${NC}"
    npm install @capacitor/core @capacitor/cli @capacitor/android
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install Capacitor. Please check the error messages above.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Capacitor is installed.${NC}"
fi

# Check for Android Studio (basic check)
echo -e "${YELLOW}Checking for Android development environment...${NC}"
if [ -d "$HOME/Library/Android" ] || [ -d "$HOME/Android" ] || [ -d "/Applications/Android Studio.app" ]; then
    echo -e "${GREEN}Android development environment appears to be installed.${NC}"
else
    echo -e "${YELLOW}Android development environment not detected.${NC}"
    echo -e "You'll need to install Android Studio from: https://developer.android.com/studio"
fi

# Build the project
echo -e "${GREEN}Building the project...${NC}"
npx vite build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Please check the error messages above.${NC}"
    exit 1
fi

# Check if Android platform is already added
if [ ! -d "android" ]; then
    echo -e "${YELLOW}Android platform not found. Adding Android platform...${NC}"
    npx cap add android
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to add Android platform. Please check the error messages above.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Android platform already added.${NC}"
fi

# Sync with Capacitor
echo -e "${GREEN}Syncing with Capacitor...${NC}"
npx cap sync android

if [ $? -ne 0 ]; then
    echo -e "${RED}Capacitor sync failed. Please check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Run ${GREEN}npx cap open android${NC} to open the project in Android Studio"
echo -e "2. In Android Studio, click on the 'Run' button to build and launch on an emulator or connected device"
echo -e ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "• ${GREEN}npx cap run android${NC} - Build and run on Android device/emulator"
echo -e "• ${GREEN}npx vite build && npx cap sync android${NC} - Build web app and sync with Android"
echo -e ""
echo -e "${BLUE}Remember to make this script executable with:${NC}"
echo -e "${GREEN}chmod +x setup-android.sh${NC}"
