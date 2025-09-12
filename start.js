 
 // Script to run Next.js development server
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Current directory:', process.cwd());
  console.log('Running Next.js dev server...');
  execSync('npm run dev', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname)
  });
} catch (error) {
  console.error('Error running npm command:', error.message);
}