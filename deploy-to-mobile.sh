
#!/bin/bash

# Make this script executable with: chmod +x deploy-to-mobile.sh

# Color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Mobile App Deployment Helper ====${NC}"
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

# Check if build-local.sh has execution permissions
if [ ! -x "./build-local.sh" ]; then
    echo -e "${YELLOW}Setting execution permissions for build-local.sh...${NC}"
    chmod +x ./build-local.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to set execution permissions. Try running: chmod +x ./build-local.sh${NC}"
        exit 1
    fi
fi

# Check if Capacitor CLI is installed
if ! command -v npx cap &> /dev/null; then
    echo -e "${YELLOW}Capacitor CLI seems to be missing. Installing...${NC}"
    npm install --save-dev @capacitor/cli
fi

# Environment information
echo -e "${YELLOW}Environment Information:${NC}"
echo -e "Node version: $(node -v || echo 'Not found')"
echo -e "NPM version: $(npm -v || echo 'Not found')"
echo -e "Working directory: $(pwd)"
echo ""

# Build the web app
echo -e "${GREEN}Step 1: Building the web application...${NC}"
./build-local.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Please fix the errors and try again.${NC}"
    exit 1
fi

# Sync with Capacitor
echo -e "${GREEN}Step 2: Syncing web code with Capacitor...${NC}"
npx cap sync

if [ $? -ne 0 ]; then
    echo -e "${RED}Capacitor sync failed. Please check the errors above.${NC}"
    exit 1
fi

# Platform selection
echo -e "${GREEN}Which platform would you like to deploy to?${NC}"
echo -e "1) ${YELLOW}Android${NC}"
echo -e "2) ${YELLOW}iOS${NC}"
read -p "Enter choice (1 or 2): " platform_choice

case $platform_choice in
    1)
        # Check if Android platform is added
        if [ ! -d "android" ]; then
            echo -e "${YELLOW}Android platform not found. Adding Android platform...${NC}"
            npx cap add android
            
            if [ $? -ne 0 ]; then
                echo -e "${RED}Failed to add Android platform. Please check the errors above.${NC}"
                exit 1
            fi
        fi
        
        echo -e "${GREEN}Opening Android Studio...${NC}"
        npx cap open android
        
        echo -e "${YELLOW}Instructions:${NC}"
        echo -e "1. In Android Studio, wait for the project to sync"
        echo -e "2. Connect your Android device with USB debugging enabled"
        echo -e "3. Select your device from the dropdown menu in the toolbar"
        echo -e "4. Click the 'Run' button (green triangle)"
        echo -e "5. The app will be installed and launched on your device"
        ;;
    2)
        # Check if iOS platform is added
        if [ ! -d "ios" ]; then
            echo -e "${YELLOW}iOS platform not found. Adding iOS platform...${NC}"
            npx cap add ios
            
            if [ $? -ne 0 ]; then
                echo -e "${RED}Failed to add iOS platform. Please check the errors above.${NC}"
                exit 1
            fi
        fi
        
        echo -e "${GREEN}Opening Xcode...${NC}"
        npx cap open ios
        
        echo -e "${YELLOW}Instructions:${NC}"
        echo -e "1. In Xcode, wait for the project to index"
        echo -e "2. Connect your iOS device"
        echo -e "3. Select your device from the dropdown menu in the toolbar"
        echo -e "4. You may need to configure signing (Developer Account)"
        echo -e "   Go to Project > Signing & Capabilities and select your team"
        echo -e "5. Click the 'Run' button (play button)"
        echo -e "6. The app will be installed and launched on your device"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}Deployment preparation complete!${NC}"
echo -e "Follow the instructions above to complete the deployment to your device."
