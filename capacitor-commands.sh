
#!/bin/bash

# Make this script executable with: chmod +x capacitor-commands.sh

# Color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Capacitor Mobile App Commands ====${NC}"
echo ""

case "$1" in
  build)
    echo -e "${GREEN}Building the app...${NC}"
    npm run build
    ;;
  sync)
    echo -e "${GREEN}Syncing with native platforms...${NC}"
    npx cap sync
    ;;
  add-android)
    echo -e "${GREEN}Adding Android platform...${NC}"
    npx cap add android
    ;;
  add-ios)
    echo -e "${GREEN}Adding iOS platform...${NC}"
    npx cap add ios
    ;;
  update)
    echo -e "${GREEN}Updating native platforms...${NC}"
    npx cap update
    ;;
  open-android)
    echo -e "${GREEN}Opening Android Studio...${NC}"
    npx cap open android
    ;;
  open-ios)
    echo -e "${GREEN}Opening Xcode...${NC}"
    npx cap open ios
    ;;
  run-android)
    echo -e "${GREEN}Building and running on Android...${NC}"
    npm run build && npx cap sync && npx cap run android
    ;;
  run-ios)
    echo -e "${GREEN}Building and running on iOS...${NC}"
    npm run build && npx cap sync && npx cap run ios
    ;;
  help)
    echo -e "${YELLOW}Available commands:${NC}"
    echo -e "  ${GREEN}./capacitor-commands.sh build${NC} - Build the web app"
    echo -e "  ${GREEN}./capacitor-commands.sh sync${NC} - Sync web code to native platforms"
    echo -e "  ${GREEN}./capacitor-commands.sh add-android${NC} - Add Android platform"
    echo -e "  ${GREEN}./capacitor-commands.sh add-ios${NC} - Add iOS platform"
    echo -e "  ${GREEN}./capacitor-commands.sh update${NC} - Update native platforms"
    echo -e "  ${GREEN}./capacitor-commands.sh open-android${NC} - Open in Android Studio"
    echo -e "  ${GREEN}./capacitor-commands.sh open-ios${NC} - Open in Xcode"
    echo -e "  ${GREEN}./capacitor-commands.sh run-android${NC} - Build and run on Android"
    echo -e "  ${GREEN}./capacitor-commands.sh run-ios${NC} - Build and run on iOS"
    echo -e "  ${GREEN}./capacitor-commands.sh help${NC} - Show this help message"
    ;;
  *)
    echo -e "${YELLOW}Unknown command: $1${NC}"
    echo -e "Run ${GREEN}./capacitor-commands.sh help${NC} to see available commands"
    ;;
esac
