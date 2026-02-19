// Debug script to check if src files are accessible
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Debugging file paths...\n');

const filesToCheck = [
  'src/config/constants.ts',
  'src/components/ui/card.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/loading-spinner.tsx',
];

filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file} - ${exists ? 'FOUND' : 'MISSING'}`);
});

console.log('\n📁 Directory structure:\n');
console.log('src/config:', fs.readdirSync(path.join(__dirname, 'src/config')));
console.log('src/components/ui:', fs.readdirSync(path.join(__dirname, 'src/components/ui')));
