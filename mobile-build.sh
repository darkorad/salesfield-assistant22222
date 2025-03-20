
#!/bin/bash

# Make this script executable with: chmod +x mobile-build.sh

# Color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== ŽIR-MD Mobile App Builder ====${NC}"
echo ""

build_and_sync() {
  echo -e "${GREEN}Building the app for production...${NC}"
  npm run build
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build successful. Syncing with Capacitor...${NC}"
    npx cap sync
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Sync completed successfully!${NC}"
      return 0
    else
      echo -e "${YELLOW}Error: Capacitor sync failed.${NC}"
      return 1
    fi
  else
    echo -e "${YELLOW}Error: Build failed.${NC}"
    return 1
  fi
}

case "$1" in
  android)
    build_and_sync
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Opening Android Studio...${NC}"
      npx cap open android
    fi
    ;;
  ios)
    build_and_sync
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Opening Xcode...${NC}"
      npx cap open ios
    fi
    ;;
  run-android)
    build_and_sync
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Running on Android...${NC}"
      npx cap run android
    fi
    ;;
  run-ios)
    build_and_sync
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Running on iOS...${NC}"
      npx cap run ios
    fi
    ;;
  setup)
    echo -e "${GREEN}Setting up Capacitor for both platforms...${NC}"
    npx cap add android
    npx cap add ios
    echo -e "${GREEN}Setup complete!${NC}"
    ;;
  help|*)
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}./mobile-build.sh android${NC} - Build and open in Android Studio"
    echo -e "  ${GREEN}./mobile-build.sh ios${NC} - Build and open in Xcode"
    echo -e "  ${GREEN}./mobile-build.sh run-android${NC} - Build and run on Android device/emulator"
    echo -e "  ${GREEN}./mobile-build.sh run-ios${NC} - Build and run on iOS device/simulator"
    echo -e "  ${GREEN}./mobile-build.sh setup${NC} - Add both platforms"
    echo -e "  ${GREEN}./mobile-build.sh help${NC} - Show this help"
    ;;
esac

echo ""
echo -e "${BLUE}Remember to make this script executable:${NC}"
echo -e "chmod +x mobile-build.sh"
