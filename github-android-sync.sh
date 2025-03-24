
#!/bin/bash

# Color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== GitHub to Android Sync Helper ====${NC}"
echo ""

# Pull latest changes from GitHub
echo -e "${YELLOW}Pulling latest changes from GitHub...${NC}"
git pull

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to pull from GitHub. Please resolve any conflicts.${NC}"
  exit 1
fi

echo -e "${GREEN}Successfully pulled latest changes!${NC}"

# Build the web app
echo -e "${YELLOW}Building the web application...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Please fix the errors and try again.${NC}"
  exit 1
fi

echo -e "${GREEN}Build completed successfully!${NC}"

# Sync with Capacitor
echo -e "${YELLOW}Syncing with Android...${NC}"
npx cap sync android

if [ $? -ne 0 ]; then
  echo -e "${RED}Capacitor sync failed. Please check the errors above.${NC}"
  exit 1
fi

echo -e "${GREEN}Sync completed successfully!${NC}"

# Check if user wants to open Android Studio
if [ "$1" == "--open" ] || [ "$1" == "-o" ]; then
  echo -e "${YELLOW}Opening Android Studio...${NC}"
  npx cap open android
fi

echo -e "${GREEN}All done! Your Android project is now in sync with GitHub.${NC}"
echo -e ""
echo -e "${YELLOW}Usage:${NC}"
echo -e "  ${GREEN}./github-android-sync.sh${NC} - Pull, build and sync"
echo -e "  ${GREEN}./github-android-sync.sh --open${NC} or ${GREEN}-o${NC} - Pull, build, sync and open Android Studio"
echo -e ""
echo -e "${BLUE}Remember to make this script executable:${NC}"
echo -e "${GREEN}chmod +x github-android-sync.sh${NC}"
