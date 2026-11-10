const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  // Backgrounds
  'bg-dark-900': 'bg-slate-50',
  'bg-dark-800': 'bg-white',
  'bg-dark-700': 'bg-slate-100',
  'bg-dark-600': 'bg-slate-200',
  'bg-dark-500': 'bg-slate-300',
  // Text
  'text-dark-50': 'text-slate-900',
  'text-dark-100': 'text-slate-800',
  'text-dark-200': 'text-slate-700',
  'text-dark-300': 'text-slate-600',
  'text-dark-400': 'text-slate-500',
  'text-dark-500': 'text-slate-400',
  // Borders
  'border-dark-800': 'border-slate-200',
  'border-dark-700': 'border-slate-300',
  'border-dark-600': 'border-slate-300',
  'border-dark-500': 'border-slate-400',
  'border-dark-400': 'border-slate-400',
  // Special combinations
  'bg-dark-900 text-white': 'bg-slate-50 text-slate-900',
  'bg-black': 'bg-white',
  'border-white/5': 'border-slate-200',
  'border-white/10': 'border-slate-200',
  'border-white/20': 'border-slate-300',
  'bg-dark-800/40': 'bg-white/40',
  'bg-dark-800/60': 'bg-white/60',
  'bg-dark-800/80': 'bg-white/80',
  'bg-dark-800/90': 'bg-white/90',
  'bg-dark-700/40': 'bg-slate-100/40',
  'bg-dark-700/50': 'bg-slate-100/50',
  'bg-dark-700/60': 'bg-slate-100/60',
  'bg-dark-900/50': 'bg-slate-50/50',
  'bg-dark-900/80': 'bg-slate-50/80',
  'bg-dark-900/90': 'bg-slate-50/90',
  'bg-dark-600/50': 'bg-slate-200/50',
};

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // specific replacements first
      for (const [key, value] of Object.entries(replacements)) {
        if (content.includes(key)) {
          content = content.split(key).join(value);
          modified = true;
        }
      }

      // Also let's handle isolated 'text-white' not in buttons
      // This is risky, but we can target specific patterns if needed
      // Let's replace 'text-white' with 'text-slate-900' only if it's on a container
      // For now, let's just stick to the replacements map

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkAndReplace(directoryPath);
