// Comprehensive Undo/Redo Test Script
// Run this in browser console to test all functionality

console.log('🧪 Starting Comprehensive Undo/Redo Tests...');

// Test 1: Basic Redux State Check
console.log('\n📋 Test 1: Redux State Check');
try {
  const state = window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__.store.getState()
    : 'Redux DevTools not available';
  console.log('Current Redux State:', state);

  if (state.diagram) {
    console.log('✅ Diagram slice exists');
    console.log('Current code:', state.diagram.mermaidCode);
    console.log('History:', state.diagram.history);
    console.log('History Index:', state.diagram.historyIndex);
  } else {
    console.log('❌ Diagram slice not found');
  }
} catch (error) {
  console.log('❌ Redux state check failed:', error);
}

// Test 2: Check if WorkingUndoRedo component is mounted
console.log('\n📋 Test 2: Component Mount Check');
const undoButtons = document.querySelectorAll('button[title*="Undo"]');
const redoButtons = document.querySelectorAll('button[title*="Redo"]');
console.log(`Found ${undoButtons.length} undo buttons`);
console.log(`Found ${redoButtons.length} redo buttons`);

if (undoButtons.length > 0) {
  console.log('✅ Undo buttons found');
  undoButtons.forEach((btn, i) => {
    console.log(`Undo button ${i}:`, btn.textContent, 'Disabled:', btn.disabled);
  });
} else {
  console.log('❌ No undo buttons found');
}

// Test 3: Test Code Editor Integration
console.log('\n📋 Test 3: Code Editor Integration');
const textareas = document.querySelectorAll('textarea');
const codeEditors = document.querySelectorAll('.monaco-editor');
console.log(`Found ${textareas.length} textareas`);
console.log(`Found ${codeEditors.length} Monaco editors`);

// Test 4: Simulate Code Changes
console.log('\n📋 Test 4: Simulating Code Changes');
if (textareas.length > 0) {
  const textarea = textareas[0];
  const originalValue = textarea.value;
  console.log('Original value:', originalValue);

  // Simulate typing
  textarea.value = 'graph TD\n    A --> B\n    B --> C';
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));

  setTimeout(() => {
    console.log('New value:', textarea.value);

    // Check if undo button is now enabled
    const undoBtn = document.querySelector('button[title*="Undo"]');
    if (undoBtn) {
      console.log('Undo button disabled after change:', undoBtn.disabled);
    }
  }, 100);
}

// Test 5: Test Button Clicks
console.log('\n📋 Test 5: Testing Button Clicks');
setTimeout(() => {
  const undoBtn = document.querySelector('button[title*="Undo"]');
  if (undoBtn && !undoBtn.disabled) {
    console.log('Clicking undo button...');
    undoBtn.click();

    setTimeout(() => {
      console.log('After undo click - checking state...');
      const textarea = document.querySelector('textarea');
      if (textarea) {
        console.log('Textarea value after undo:', textarea.value);
      }
    }, 100);
  } else {
    console.log('Undo button not available or disabled');
  }
}, 500);

// Test 6: Test Keyboard Shortcuts
console.log('\n📋 Test 6: Testing Keyboard Shortcuts');
setTimeout(() => {
  console.log('Simulating Ctrl+Z...');
  const event = new KeyboardEvent('keydown', {
    key: 'z',
    ctrlKey: true,
    bubbles: true,
  });
  document.dispatchEvent(event);

  setTimeout(() => {
    console.log('After Ctrl+Z - checking state...');
    const textarea = document.querySelector('textarea');
    if (textarea) {
      console.log('Textarea value after Ctrl+Z:', textarea.value);
    }
  }, 100);
}, 1000);

// Test 7: Check Event Listeners
console.log('\n📋 Test 7: Event Listeners Check');
console.log(
  'Window event listeners:',
  Object.keys(window).filter((key) => key.startsWith('on'))
);

// Test 8: Check for Errors
console.log('\n📋 Test 8: Error Check');
window.addEventListener('error', (e) => {
  console.log('❌ JavaScript Error:', e.error);
});

console.log('\n🏁 Test script setup complete. Check results above and in next few seconds...');
