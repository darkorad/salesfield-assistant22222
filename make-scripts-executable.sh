
#!/bin/bash

# Make sure the script has the correct line endings
dos2unix build-local.sh 2>/dev/null || echo "dos2unix not available, skipping"
dos2unix capacitor-commands.sh 2>/dev/null || echo "dos2unix not available, skipping"

# Make scripts executable
chmod +x build-local.sh
chmod +x capacitor-commands.sh

echo "Scripts are now executable. You can run them with:"
echo "./build-local.sh"
echo "./capacitor-commands.sh [command]"
