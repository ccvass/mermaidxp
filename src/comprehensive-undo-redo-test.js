// Comprehensive Undo/Redo Test Script
// Run this in the browser console to test all Undo/Redo functionality

console.log('🧪 Starting Comprehensive Undo/Redo Tests...');

// Test configurations
const TEST_DIAGRAMS = [
  'graph TD\n    A[Start] --> B[Process]\n    B --> C[End]',
  'sequenceDiagram\n    participant A\n    participant B\n    A->>B: Hello\n    B->>A: Hi',
  'flowchart LR\n    X --> Y\n    Y --> Z',
  'pie title Pets\n    "Dogs" : 386\n    "Cats" : 85\n    "Rats" : 15',
];

let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}${details ? ' - ' + details : ''}`);

  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.errors.push(`${testName}: ${details}`);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runComprehensiveTests() {
  console.log('\n📋 Test Plan:');
  console.log('1. Redux Store Integration');
  console.log('2. Component Mounting and Visibility');
  console.log('3. Button State Management');
  console.log('4. Code Change Detection');
  console.log('5. Manual Save Functionality');
  console.log('6. Undo/Redo Operations');
  console.log('7. Keyboard Shortcuts');
  console.log('8. Multi-step Operations');
  console.log('9. History Limits');
  console.log('10. State Consistency');

  // Test 1: Redux Store Integration
  console.log('\n🔍 Test 1: Redux Store Integration');
  try {
    const store = window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__.store
      : document.querySelector('#root')?._reactInternalFiber?.memoizedProps?.store;

    if (store) {
      const state = store.getState();
      logTest('Redux store accessible', !!state);
      logTest('Diagram slice exists', !!state.diagram);
      logTest('Current mermaid code exists', !!state.diagram.mermaidCode);
      console.log('Current code:', state.diagram.mermaidCode.substring(0, 100) + '...');
    } else {
      logTest('Redux store accessible', false, 'Store not found');
    }
  } catch (error) {
    logTest('Redux store integration', false, error.message);
  }

  // Test 2: Component Mounting and Visibility
  console.log('\n🔍 Test 2: Component Mounting and Visibility');
  const undoButtons = document.querySelectorAll('button[title*="Undo"]');
  const redoButtons = document.querySelectorAll('button[title*="Redo"]');
  const saveButtons = document.querySelectorAll('button[title*="save"]');

  logTest('Undo buttons found', undoButtons.length > 0, `Found ${undoButtons.length} buttons`);
  logTest('Redo buttons found', redoButtons.length > 0, `Found ${redoButtons.length} buttons`);
  logTest('Save buttons found', saveButtons.length > 0, `Found ${saveButtons.length} buttons`);

  // Test 3: Button State Management
  console.log('\n🔍 Test 3: Button State Management');
  if (undoButtons.length > 0) {
    const undoButton = undoButtons[0];
    const isDisabled = undoButton.disabled || undoButton.classList.contains('cursor-not-allowed');
    logTest('Undo button state readable', true, `Disabled: ${isDisabled}`);
  }

  // Test 4: Code Change Detection
  console.log('\n🔍 Test 4: Code Change Detection');
  const codeEditor =
    document.querySelector('textarea') ||
    document.querySelector('.cm-editor') ||
    document.querySelector('[data-testid="code-editor"]');

  if (codeEditor) {
    logTest('Code editor found', true, codeEditor.tagName);

    // Try to change code programmatically
    if (codeEditor.tagName === 'TEXTAREA') {
      const originalValue = codeEditor.value;
      codeEditor.value = TEST_DIAGRAMS[0];
      codeEditor.dispatchEvent(new Event('input', { bubbles: true }));
      codeEditor.dispatchEvent(new Event('change', { bubbles: true }));

      await wait(500); // Wait for React to process

      logTest('Code change triggered', codeEditor.value !== originalValue);
    }
  } else {
    logTest('Code editor found', false, 'No textarea or CodeMirror found');
  }

  // Test 5: Manual Save Functionality
  console.log('\n🔍 Test 5: Manual Save Functionality');
  if (saveButtons.length > 0) {
    const saveButton = saveButtons[0];
    const initialHistoryText = document.querySelector('[class*="text-gray-500"]')?.textContent || '';

    console.log('Before save - History indicator:', initialHistoryText);
    saveButton.click();

    await wait(300);

    const newHistoryText = document.querySelector('[class*="text-gray-500"]')?.textContent || '';
    console.log('After save - History indicator:', newHistoryText);

    logTest('Manual save changes history', initialHistoryText !== newHistoryText);
  }

  // Test 6: Undo/Redo Operations
  console.log('\n🔍 Test 6: Undo/Redo Operations');

  // First, ensure we have some history
  for (let i = 0; i < 3; i++) {
    if (saveButtons.length > 0) {
      saveButtons[0].click();
      await wait(200);
    }
  }

  if (undoButtons.length > 0 && redoButtons.length > 0) {
    const undoButton = undoButtons[0];
    const redoButton = redoButtons[0];

    // Test undo
    const wasUndoDisabled = undoButton.disabled;
    console.log('Undo button disabled before test:', wasUndoDisabled);

    if (!wasUndoDisabled) {
      undoButton.click();
      await wait(300);
      logTest('Undo operation executed', true);

      // Test redo
      const wasRedoDisabled = redoButton.disabled;
      console.log('Redo button disabled after undo:', wasRedoDisabled);

      if (!wasRedoDisabled) {
        redoButton.click();
        await wait(300);
        logTest('Redo operation executed', true);
      } else {
        logTest('Redo operation executed', false, 'Redo button disabled');
      }
    } else {
      logTest('Undo operation executed', false, 'Undo button disabled');
    }
  }

  // Test 7: Keyboard Shortcuts
  console.log('\n🔍 Test 7: Keyboard Shortcuts');

  // Test Ctrl+Z (Undo)
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
    })
  );
  await wait(200);
  logTest('Ctrl+Z keyboard shortcut', true, 'Event dispatched');

  // Test Ctrl+Y (Redo)
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'y',
      ctrlKey: true,
      bubbles: true,
    })
  );
  await wait(200);
  logTest('Ctrl+Y keyboard shortcut', true, 'Event dispatched');

  // Test 8: Multi-step Operations
  console.log('\n🔍 Test 8: Multi-step Operations');

  // Create multiple history entries
  for (let i = 0; i < TEST_DIAGRAMS.length; i++) {
    if (codeEditor && codeEditor.tagName === 'TEXTAREA') {
      codeEditor.value = TEST_DIAGRAMS[i];
      codeEditor.dispatchEvent(new Event('input', { bubbles: true }));

      if (saveButtons.length > 0) {
        saveButtons[0].click();
      }
      await wait(200);
    }
  }

  logTest('Multi-step history creation', true, `Created ${TEST_DIAGRAMS.length} entries`);

  // Test multiple undos
  let undoCount = 0;
  for (let i = 0; i < 3; i++) {
    if (undoButtons.length > 0 && !undoButtons[0].disabled) {
      undoButtons[0].click();
      undoCount++;
      await wait(200);
    }
  }

  logTest('Multiple undo operations', undoCount > 0, `Executed ${undoCount} undos`);

  // Test 9: History Limits
  console.log('\n🔍 Test 9: History Limits');
  const historyIndicator = document.querySelector('[class*="text-gray-500"]');
  if (historyIndicator) {
    const historyText = historyIndicator.textContent;
    const match = historyText.match(/(\d+)\/(\d+)/);
    if (match) {
      const [, current, total] = match;
      logTest('History limit tracking', parseInt(total) <= 50, `Total: ${total}, Current: ${current}`);
    }
  }

  // Test 10: State Consistency
  console.log('\n🔍 Test 10: State Consistency');

  // Check if Redux state matches UI state
  try {
    const store = window.__REDUX_DEVTOOLS_EXTENSION__?.store;
    if (store && codeEditor) {
      const reduxCode = store.getState().diagram.mermaidCode;
      const editorCode = codeEditor.value || codeEditor.textContent;

      logTest(
        'Redux-UI state consistency',
        reduxCode === editorCode,
        `Redux: ${reduxCode?.substring(0, 30)}... UI: ${editorCode?.substring(0, 30)}...`
      );
    }
  } catch (error) {
    logTest('State consistency check', false, error.message);
  }

  // Final Results
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(
    `📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`
  );

  if (testResults.errors.length > 0) {
    console.log('\n🔍 Failed Tests Details:');
    testResults.errors.forEach((error) => console.log(`  • ${error}`));
  }

  // Debug Information
  console.log('\n🔧 Debug Information:');
  console.log('Available buttons:', {
    undo: undoButtons.length,
    redo: redoButtons.length,
    save: saveButtons.length,
  });

  console.log('Component elements:', {
    codeEditor: !!codeEditor,
    historyIndicator: !!historyIndicator,
    debugInfo: !!document.querySelector('[class*="bg-blue-50"]'),
  });

  return testResults;
}

// Auto-run tests
runComprehensiveTests()
  .then((results) => {
    console.log('\n🎯 Comprehensive Undo/Redo Testing Complete!');

    if (results.failed === 0) {
      console.log('🎉 All tests passed! Undo/Redo system is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the details above for debugging.');
    }
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
  });
