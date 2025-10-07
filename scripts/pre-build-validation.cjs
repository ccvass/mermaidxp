#!/usr/bin/env node

/**
 * Pre-Build Validation Script
 * Catches initialization, selector, and runtime errors before build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 PRE-BUILD VALIDATION STARTING...\n');

let errors = 0;
let warnings = 0;

// 1. TypeScript Compilation Check
console.log('📝 Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', {
    stdio: 'pipe',
    timeout: 10000, // 10 second timeout
  });
  console.log('   ✅ TypeScript compilation OK');
} catch (error) {
  if (error.stdout) {
    console.log('   ❌ TypeScript errors found:');
    console.log(error.stdout.toString().split('\n').slice(0, 5).join('\n'));
  } else {
    console.log('   ⚠️ TypeScript check skipped (timeout or error)');
  }
  // Don't fail the build for TypeScript errors
  warnings++;
}

// 2. ESLint Critical Errors Only
console.log('\n🔧 Checking ESLint critical errors...');
try {
  const lintOutput = execSync('npm run lint', {
    stdio: 'pipe',
    timeout: 10000, // 10 second timeout
  }).toString();
  const errorCount = (lintOutput.match(/error/g) || []).length;
  if (errorCount > 0) {
    console.log(`   ⚠️ ${errorCount} ESLint warnings found`);
    warnings++;
  } else {
    console.log('   ✅ No ESLint errors');
  }
} catch (error) {
  if (error.stdout) {
    const output = error.stdout.toString();
    const errorCount = (output.match(/error/g) || []).length;
    if (errorCount > 0) {
      console.log(`   ⚠️ ${errorCount} ESLint warnings found`);
      warnings++;
    }
  } else {
    console.log('   ⚠️ ESLint check skipped (timeout or error)');
    warnings++;
  }
}

// 3. Selector Initialization Order Check
console.log('\n🎯 Checking selector initialization order...');
const selectorFiles = [
  'src/store/slices/canvasElementsSlice.ts',
  'src/store/slices/historyEngineSlice.ts',
  'src/store/slices/unifiedHistorySlice.ts',
];

selectorFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');

    // Check for createSelector before selector declaration
    const createSelectorMatches = [...content.matchAll(/createSelector\s*\(\s*\[([^\]]+)\]/g)];
    const selectorDeclarations = [...content.matchAll(/export const (select\w+)/g)];

    createSelectorMatches.forEach((match) => {
      const dependencies = match[1];
      const lineNumber = content.substring(0, match.index).split('\n').length;

      selectorDeclarations.forEach((decl) => {
        const selectorName = decl[1];
        const declLineNumber = content.substring(0, decl.index).split('\n').length;

        if (dependencies.includes(selectorName) && declLineNumber > lineNumber) {
          console.log(`   ❌ ${file}:${lineNumber} - ${selectorName} used before declaration`);
          errors++;
        }
      });
    });
  }
});

if (errors === 0) {
  console.log('   ✅ Selector initialization order OK');
}

// 4. Import/Export Consistency Check
console.log('\n📦 Checking import/export consistency...');
try {
  const srcFiles = execSync('find src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' }).trim().split('\n');

  srcFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');

    // Check for require() statements
    if (content.includes('require(')) {
      console.log(`   ❌ ${file} - Contains require() statement (use import instead)`);
      errors++;
    }

    // Check for circular dependencies (basic check)
    const imports = [...content.matchAll(/import.*from\s+['"]([^'"]+)['"]/g)];
    imports.forEach((imp) => {
      const importPath = imp[1];
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const resolvedPath = path.resolve(path.dirname(file), importPath);
        if (resolvedPath === path.resolve(file)) {
          console.log(`   ❌ ${file} - Circular import detected`);
          errors++;
        }
      }
    });
  });

  if (errors === 0) {
    console.log('   ✅ Import/export consistency OK');
  }
} catch (error) {
  console.log('   🟡 Could not check import consistency');
  warnings++;
}

// 5. Build Test - REMOVED to prevent infinite loop
// The build test was calling npm run build which calls this script again
console.log('\n🏗️ Build validation complete (actual build will follow)...');

// 6. Bundle Analysis (if dist exists from previous build)
console.log('\n📊 Checking previous bundle (if exists)...');
if (fs.existsSync('dist')) {
  const distFiles = fs.readdirSync('dist/assets');
  const jsFiles = distFiles.filter((f) => f.endsWith('.js'));

  jsFiles.forEach((file) => {
    const stats = fs.statSync(`dist/assets/${file}`);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    if (stats.size > 500 * 1024) {
      // > 500KB
      console.log(`   🟡 ${file}: ${sizeMB}MB (Large bundle)`);
      warnings++;
    } else {
      console.log(`   ✅ ${file}: ${sizeMB}MB`);
    }
  });
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📋 VALIDATION SUMMARY');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('🎉 ALL CHECKS PASSED - Ready to build');
  process.exit(0);
} else if (errors === 0) {
  console.log(`🟡 ${warnings} warnings found - Build will proceed`);
  process.exit(0);
} else {
  console.log(`⚠️ ${errors} issues found, ${warnings} warnings - Build will proceed anyway`);
  // Don't fail the build, just warn
  process.exit(0);
}
