
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

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx is not installed or not in PATH${NC}"
    echo "Please ensure you have a recent version of Node.js and npm installed."
    exit 1
fi

echo -e "${YELLOW}Environment Information:${NC}"
echo -e "Node version: $(node -v || echo 'Not found')"
echo -e "NPM version: $(npm -v || echo 'Not found')"
echo -e "NPX version: $(npx -v || echo 'Not found')"
echo -e "Working directory: $(pwd)"
echo -e "Local node_modules/.bin path: $(npm bin)"
echo ""

echo -e "${GREEN}Building the application using local vite installation...${NC}"
export PATH="$(npm bin):$PATH"
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
