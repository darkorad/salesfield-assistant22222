
#!/bin/bash

# Make sure the script has the correct line endings
dos2unix build-local.sh 2>/dev/null || echo "dos2unix not available, skipping"
dos2unix capacitor-commands.sh 2>/dev/null || echo "dos2unix not available, skipping"
dos2unix deploy-to-mobile.sh 2>/dev/null || echo "dos2unix not available, skipping"
dos2unix github-android-sync.sh 2>/dev/null || echo "dos2unix not available, skipping"

# Make scripts executable
chmod +x build-local.sh
chmod +x capacitor-commands.sh
chmod +x deploy-to-mobile.sh
chmod +x github-android-sync.sh

echo "Scripts are now executable. You can run them with:"
echo "./build-local.sh"
echo "./capacitor-commands.sh [command]"
echo "./deploy-to-mobile.sh"
echo "./github-android-sync.sh [--open/-o]"
