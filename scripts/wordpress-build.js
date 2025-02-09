
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Build the React app
console.log('Building React app...');
execSync('npm run build', { stdio: 'inherit' });

// Create WordPress plugin directory
const pluginDir = path.join(__dirname, '../wordpress/sales-app');
if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true });
}

// Copy build files
console.log('Copying build files to plugin directory...');
fs.cpSync(path.join(__dirname, '../build'), path.join(pluginDir, 'build'), { recursive: true });

// Copy PHP files
console.log('Copying PHP files...');
fs.copyFileSync(
    path.join(__dirname, '../wordpress/sales-app.php'),
    path.join(pluginDir, 'sales-app.php')
);

console.log('WordPress plugin built successfully!');
