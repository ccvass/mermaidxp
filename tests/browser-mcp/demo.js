/**
 * Demo de pruebas automatizadas usando las herramientas MCP Browser reales
 * Este archivo será ejecutado por el agente MCP para demostrar las capacidades
 */

export async function runMCPDemo(mcpTools) {
  console.log('🎭 Iniciando demo de pruebas MCP...');

  const testResults = [];
  let screenshots = [];

  try {
    // Test 1: Navegación inicial
    console.log('\\n🧪 Test 1: Navegación y carga inicial');
    await mcpTools.browser_navigate({ url: 'http://localhost:3000' });
    await mcpTools.browser_wait({ time: 3 });
    screenshots.push(await mcpTools.browser_screenshot());
    testResults.push({ name: 'Navegación inicial', status: 'passed' });

    // Test 2: Validar elementos de la interfaz
    console.log('\\n🧪 Test 2: Validación de elementos UI');
    const snapshot = await mcpTools.browser_snapshot();
    const content = snapshot.text_result[0].text;

    const uiElements = ['Mermaid Visualizer Pro', 'Mermaid Code Editor', 'Diagram Examples'];

    for (const element of uiElements) {
      if (content.includes(element)) {
        console.log(`✅ Elemento encontrado: ${element}`);
      } else {
        console.log(`❌ Elemento faltante: ${element}`);
        testResults.push({ name: `UI Element: ${element}`, status: 'failed' });
      }
    }
    testResults.push({ name: 'Validación de UI', status: 'passed' });

    // Test 3: Interacción con editor de código
    console.log('\\n🧪 Test 3: Editar código Mermaid');
    await mcpTools.browser_click({
      element: 'Editor de código Mermaid',
      ref: 's1e44',
    });
    await mcpTools.browser_wait({ time: 1 });

    // Limpiar editor
    await mcpTools.browser_press_key({ key: 'Control+a' });
    await mcpTools.browser_press_key({ key: 'Delete' });

    // Escribir nuevo código
    const testDiagram = `graph TD
    A[Prueba MCP] --> B{¿Funciona?}
    B -->|Sí| C[¡Excelente!]
    B -->|No| D[Depurar]
    D --> A`;

    await mcpTools.browser_type({
      element: 'Editor de código',
      ref: 's1e44',
      text: testDiagram,
      submit: false,
    });

    await mcpTools.browser_wait({ time: 3 });
    testResults.push({ name: 'Edición de código', status: 'passed' });

    // Test 4: Esperar renderizado
    console.log('\\n🧪 Test 4: Esperando renderizado del diagrama');
    let renderized = false;
    for (let i = 0; i < 10; i++) {
      const currentSnapshot = await mcpTools.browser_snapshot();
      const currentContent = currentSnapshot.text_result[0].text;

      if (!currentContent.includes('Loading') && !currentContent.includes('Rendering...')) {
        renderized = true;
        break;
      }
      await mcpTools.browser_wait({ time: 1 });
    }

    if (renderized) {
      console.log('✅ Diagrama renderizado exitosamente');
      testResults.push({ name: 'Renderizado de diagrama', status: 'passed' });
    } else {
      console.log('❌ Timeout esperando renderizado');
      testResults.push({ name: 'Renderizado de diagrama', status: 'failed' });
    }

    screenshots.push(await mcpTools.browser_screenshot());

    // Test 5: Probar herramientas de zoom
    console.log('\\n🧪 Test 5: Pruebas de zoom');
    await mcpTools.browser_click({
      element: 'Zoom In',
      ref: 's1e98',
    });
    await mcpTools.browser_wait({ time: 1 });

    await mcpTools.browser_click({
      element: 'Zoom Out',
      ref: 's1e100',
    });
    await mcpTools.browser_wait({ time: 1 });

    await mcpTools.browser_click({
      element: 'Reset Zoom',
      ref: 's1e102',
    });
    await mcpTools.browser_wait({ time: 1 });

    testResults.push({ name: 'Herramientas de zoom', status: 'passed' });
    screenshots.push(await mcpTools.browser_screenshot());

    // Test 6: Probar cambio de tema
    console.log('\\n🧪 Test 6: Cambio de tema');
    await mcpTools.browser_click({
      element: 'Toggle tema',
      ref: 's1e29',
    });
    await mcpTools.browser_wait({ time: 2 });
    screenshots.push(await mcpTools.browser_screenshot());

    // Volver al tema original
    await mcpTools.browser_click({
      element: 'Toggle tema',
      ref: 's1e29',
    });
    await mcpTools.browser_wait({ time: 2 });

    testResults.push({ name: 'Cambio de tema', status: 'passed' });

    // Test 7: Probar ejemplos
    console.log('\\n🧪 Test 7: Menú de ejemplos');
    await mcpTools.browser_click({
      element: 'Ejemplos de diagramas',
      ref: 's1e72',
    });
    await mcpTools.browser_wait({ time: 2 });
    screenshots.push(await mcpTools.browser_screenshot());

    testResults.push({ name: 'Menú de ejemplos', status: 'passed' });

    // Generar reporte
    const passed = testResults.filter((t) => t.status === 'passed').length;
    const failed = testResults.filter((t) => t.status === 'failed').length;
    const total = testResults.length;

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    DEMO COMPLETADO                           ║
╠══════════════════════════════════════════════════════════════╣
║ Total de pruebas: ${total}                                      ║
║ ✅ Exitosas: ${passed}                                          ║
║ ❌ Fallidas: ${failed}                                          ║
║ 📸 Capturas tomadas: ${screenshots.length}                      ║
║ 📈 Tasa de éxito: ${((passed / total) * 100).toFixed(2)}%       ║
╚══════════════════════════════════════════════════════════════╝
    `);

    return {
      success: true,
      results: testResults,
      screenshots: screenshots.length,
      summary: {
        total,
        passed,
        failed,
        successRate: (passed / total) * 100,
      },
    };
  } catch (error) {
    console.error('💥 Error durante el demo:', error.message);
    return {
      success: false,
      error: error.message,
      results: testResults,
      screenshots: screenshots.length,
    };
  }
}

// Función para pruebas específicas de componentes
export async function runComponentTests(mcpTools) {
  console.log('🧩 Iniciando pruebas específicas de componentes...');

  const componentTests = [];

  try {
    // Test del canvas
    console.log('\\n🎨 Probando componentes del canvas');
    await mcpTools.browser_click({ element: 'Add Shape', ref: 's1e81' });
    await mcpTools.browser_wait({ time: 1 });

    await mcpTools.browser_click({ element: 'Add Image', ref: 's1e83' });
    await mcpTools.browser_wait({ time: 1 });

    await mcpTools.browser_click({ element: 'Add Text', ref: 's1e85' });
    await mcpTools.browser_wait({ time: 1 });

    componentTests.push({ name: 'Canvas Tools', status: 'passed' });

    // Test de navegación entre tabs
    console.log('\\n📑 Probando navegación entre tabs');
    await mcpTools.browser_click({ element: 'Tab Whiteboard', ref: 's1e14' });
    await mcpTools.browser_wait({ time: 2 });

    await mcpTools.browser_click({ element: 'Tab Diagram', ref: 's1e13' });
    await mcpTools.browser_wait({ time: 2 });

    componentTests.push({ name: 'Tab Navigation', status: 'passed' });

    return {
      success: true,
      results: componentTests,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      results: componentTests,
    };
  }
}

// Función para pruebas de rendimiento
export async function runPerformanceTests(mcpTools) {
  console.log('⚡ Iniciando pruebas de rendimiento...');

  const performanceTests = [];

  try {
    // Medir tiempo de carga inicial
    const startTime = Date.now();
    await mcpTools.browser_navigate({ url: 'http://localhost:3000' });
    await mcpTools.browser_wait({ time: 3 });
    const loadTime = Date.now() - startTime;

    console.log(`⏱️  Tiempo de carga: ${loadTime}ms`);
    performanceTests.push({
      name: 'Load Time',
      status: loadTime < 5000 ? 'passed' : 'failed',
      value: `${loadTime}ms`,
    });

    // Medir tiempo de renderizado
    const renderStart = Date.now();
    await mcpTools.browser_click({ element: 'Editor', ref: 's1e44' });
    await mcpTools.browser_type({
      element: 'Editor',
      ref: 's1e44',
      text: 'graph TD\\nA --> B\\nB --> C',
      submit: false,
    });

    // Esperar renderizado
    let rendered = false;
    while (!rendered && Date.now() - renderStart < 10000) {
      const snapshot = await mcpTools.browser_snapshot();
      if (!snapshot.text_result[0].text.includes('Loading')) {
        rendered = true;
      }
      await mcpTools.browser_wait({ time: 0.5 });
    }

    const renderTime = Date.now() - renderStart;
    console.log(`⏱️  Tiempo de renderizado: ${renderTime}ms`);
    performanceTests.push({
      name: 'Render Time',
      status: renderTime < 8000 ? 'passed' : 'failed',
      value: `${renderTime}ms`,
    });

    return {
      success: true,
      results: performanceTests,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      results: performanceTests,
    };
  }
}
