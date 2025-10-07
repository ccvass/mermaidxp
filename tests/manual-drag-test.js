/**
 * Manual Drag and Drop Test Script
 *
 * Instructions:
 * 1. Open http://localhost:3000 in your browser
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Run it by pressing Enter
 * 5. Watch the automated tests run
 */

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function simulateMouseEvent(element, eventType, clientX, clientY) {
  const event = new MouseEvent(eventType, {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: clientX,
    clientY: clientY,
    button: 0,
    buttons: 1,
  });
  element.dispatchEvent(event);
}

function simulatePointerEvent(element, eventType, clientX, clientY, pointerId = 1) {
  const event = new PointerEvent(eventType, {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: clientX,
    clientY: clientY,
    button: 0,
    buttons: 1,
    pointerId: pointerId,
    pressure: eventType === 'pointerdown' ? 0.5 : 0,
  });
  element.dispatchEvent(event);
}

async function simulateDrag(element, startX, startY, endX, endY, steps = 5) {
  console.log(`🎯 Simulating drag from (${startX}, ${startY}) to (${endX}, ${endY})`);

  simulatePointerEvent(element, 'pointerdown', startX, startY);
  await sleep(50);

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const currentX = startX + (endX - startX) * progress;
    const currentY = startY + (endY - startY) * progress;

    simulatePointerEvent(element, 'pointermove', currentX, currentY);
    await sleep(20);
  }

  simulatePointerEvent(element, 'pointerup', endX, endY);
  await sleep(100);
}

async function testDragAndDrop() {
  console.log('🚀 Starting Drag and Drop Tests...\n');

  // Clear console for cleaner output
  console.clear();
  console.log('🚀 DRAG AND DROP AUTOMATED TEST\n');

  // Test 1: Check initial state
  console.log('📋 TEST 1: Check initial Pan Mode state');
  const panButton =
    document.querySelector('button[title*="pan" i], button[title*="Pan"]') ||
    Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Pan Mode'));

  if (panButton) {
    console.log('✅ Pan mode button found:', panButton.textContent.trim());
    const hasCorrectIcon = panButton.textContent.includes('✋');
    console.log(`${hasCorrectIcon ? '✅' : '❌'} Correct pan icon (✋): ${hasCorrectIcon}`);
  } else {
    console.log('❌ Pan mode button not found');
  }

  await sleep(500);

  // Test 2: Test pan functionality in pan mode
  console.log('\n📋 TEST 2: Test pan functionality in Pan Mode');
  const container = document.getElementById('mermaid-container');

  if (container) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    console.log('🖱️ Simulating pan drag...');
    await simulateDrag(container, centerX, centerY, centerX + 50, centerY + 30);
    console.log('✅ Pan drag simulation completed');
  } else {
    console.log('❌ Container not found');
  }

  await sleep(500);

  // Test 3: Switch to drag mode
  console.log('\n📋 TEST 3: Switch to Drag Mode');
  if (panButton) {
    console.log('🖱️ Clicking mode button to switch to drag mode...');
    panButton.click();
    await sleep(200);

    // Check if mode changed
    const dragButton =
      document.querySelector('button[title*="drag" i], button[title*="Drag"]') ||
      Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Drag Mode'));

    if (dragButton) {
      console.log('✅ Successfully switched to:', dragButton.textContent.trim());
      const hasCorrectIcon = dragButton.textContent.includes('🖱️');
      console.log(`${hasCorrectIcon ? '✅' : '❌'} Correct drag icon (🖱️): ${hasCorrectIcon}`);
    } else {
      console.log('❌ Drag mode not activated');
    }
  }

  await sleep(500);

  // Test 4: Test element drag in drag mode
  console.log('\n📋 TEST 4: Test element drag in Drag Mode');
  const draggableElements = document.querySelectorAll('.draggable-element');
  console.log(`🔍 Found ${draggableElements.length} draggable elements`);

  if (draggableElements.length > 0) {
    const firstElement = draggableElements[0];
    const rect = firstElement.getBoundingClientRect();
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;

    console.log('🎯 Attempting to drag first draggable element...');
    console.log('Element ID:', firstElement.id || 'no-id');
    console.log('Element classes:', firstElement.className);

    await simulateDrag(firstElement, elementCenterX, elementCenterY, elementCenterX + 30, elementCenterY + 20);
    console.log('✅ Element drag simulation completed');
  } else {
    console.log('❌ No draggable elements found');
  }

  await sleep(500);

  // Test 5: Test fallback pan in drag mode (empty area)
  console.log('\n📋 TEST 5: Test fallback pan in Drag Mode (empty area)');
  if (container) {
    const rect = container.getBoundingClientRect();
    // Try top-left corner which should be empty
    const emptyX = rect.left + 50;
    const emptyY = rect.top + 50;

    console.log('🖱️ Simulating drag in empty area for fallback pan...');
    await simulateDrag(container, emptyX, emptyY, emptyX + 40, emptyY + 25);
    console.log('✅ Fallback pan simulation completed');
  }

  await sleep(500);

  // Test 6: Switch back to pan mode
  console.log('\n📋 TEST 6: Switch back to Pan Mode');
  const currentModeButton =
    document.querySelector('button[title*="drag" i], button[title*="Drag"]') ||
    Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Drag Mode'));

  if (currentModeButton) {
    console.log('🖱️ Switching back to pan mode...');
    currentModeButton.click();
    await sleep(200);

    const panButtonAgain =
      document.querySelector('button[title*="pan" i], button[title*="Pan"]') ||
      Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Pan Mode'));

    if (panButtonAgain) {
      console.log('✅ Successfully switched back to:', panButtonAgain.textContent.trim());
    } else {
      console.log('❌ Failed to switch back to pan mode');
    }
  }

  console.log('\n🏁 TEST COMPLETE!');
  console.log('📊 Check the console logs above for detailed interaction events');
  console.log('👀 Watch for logs that start with:');
  console.log('  • 🎛️ Toolbar render - interactionMode:');
  console.log('  • 🖱️ PointerDown in [mode] mode');
  console.log('  • 🟢 Starting canvas pan');
  console.log('  • 🔍 Checking element: isDraggable=');
  console.log('  • 🎯 Direct drag handler activated!');
  console.log('  • 📐 Canvas pan: delta');
  console.log('\n💡 If you see these logs, the drag and drop system is working correctly!');
}

// Auto-run the tests
console.log('⏰ Starting tests in 2 seconds...');
setTimeout(testDragAndDrop, 2000);
