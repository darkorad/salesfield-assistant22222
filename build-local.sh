
#!/bin/bash

# Make this script executable with: chmod +x build-local.sh

# Color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Local Build Helper ====${NC}"
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

echo -e "${YELLOW}Environment Information:${NC}"
echo -e "Node version: $(node -v || echo 'Not found')"
echo -e "NPM version: $(npm -v || echo 'Not found')"
echo -e "Working directory: $(pwd)"
echo ""

# Ensure required dependencies are installed
echo -e "${YELLOW}Checking dependencies...${NC}"
if [ ! -d "node_modules/vite" ]; then
    echo -e "${YELLOW}Vite not found in node_modules, running npm install...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}npm install failed. Trying with --legacy-peer-deps...${NC}"
        npm install --legacy-peer-deps
    fi
fi

# Use npx to run the local vite installation
echo -e "${GREEN}Building the application...${NC}"
npx vite build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build completed successfully!${NC}"
    
    if [ -d "dist" ]; then
        echo -e "${YELLOW}Build output (dist directory):${NC}"
        ls -la dist
    else
        echo -e "${RED}Warning: dist directory was not created${NC}"
    fi
else
    echo -e "${RED}Build failed${NC}"
    exit 1
fi
