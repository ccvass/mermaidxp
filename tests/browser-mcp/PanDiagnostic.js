import { MCPTestRunner } from './TestRunner.js';
import { TEST_CONFIG, WAIT_TIMES } from './config.js';

export class PanDiagnosticTest {
  constructor(mcpTools) {
    this.testRunner = new MCPTestRunner(mcpTools);
    this.config = TEST_CONFIG;
    this.mcpTools = mcpTools;
  }

  async runPanDiagnostics() {
    console.log('🔧 DIAGNÓSTICO COMPLETO DE FUNCIONALIDAD PAN');
    console.log('='.repeat(60));

    await this.testRunner.initialize();

    // Paso 1: Verificar que hay un diagrama renderizado
    await this.ensureDiagramExists();

    // Paso 2: Verificar estado inicial del modo pan
    await this.checkPanModeStatus();

    // Paso 3: Forzar modo pan si no está activo
    await this.activatePanMode();

    // Paso 4: Diagnosticar eventos de pan
    await this.testPanEvents();

    // Paso 5: Probar arrastre real del diagrama
    await this.testActualPanDrag();

    // Paso 6: Verificar transformaciones del SVG
    await this.checkSVGTransformations();

    return this.testRunner.generateReport();
  }

  async ensureDiagramExists() {
    await this.testRunner.runTest('Verificar/Cargar diagrama para pruebas de pan', async () => {
      let snapshot = await this.testRunner.getPageSnapshot();
      let hasContent = snapshot.text_result[0].text.includes('svg');

      if (!hasContent) {
        console.log('📊 No hay diagrama. Cargando diagrama de prueba...');

        // Intentar cargar usando el editor
        await this.testRunner.clickElement(this.config.selectors.codeEditor, 'Editor de código');
        await this.testRunner.pressKey('Control+a');
        await this.testRunner.typeText(
          this.config.selectors.codeEditor,
          this.config.testData.simpleDiagram,
          'Editor de código'
        );

        // Esperar renderizado
        await this.testRunner.waitForDiagramRender();
        await this.testRunner.wait(WAIT_TIMES.medium);

        snapshot = await this.testRunner.getPageSnapshot();
        if (!snapshot.text_result[0].text.includes('svg')) {
          throw new Error('No se pudo cargar diagrama para pruebas de pan');
        }
      }

      console.log('✅ Diagrama confirmado para pruebas de pan');
      await this.testRunner.takeScreenshot('diagram-ready-for-pan');
    });
  }

  async checkPanModeStatus() {
    await this.testRunner.runTest('Verificar estado del modo pan', async () => {
      const snapshot = await this.testRunner.getPageSnapshot();
      const pageContent = snapshot.text_result[0].text;

      console.log('🔍 Analizando estado actual del modo de interacción...');

      // Buscar indicadores de modo pan
      const hasPanMode = pageContent.includes('Pan') || pageContent.includes('✋') || pageContent.includes('grab');
      const hasDragMode = pageContent.includes('Drag') || pageContent.includes('🖱️') || pageContent.includes('drag');

      console.log(`Estado detectado - Pan: ${hasPanMode}, Drag: ${hasDragMode}`);

      if (!hasPanMode && !hasDragMode) {
        console.log('⚠️ No se detectó modo de interacción claro');
      }

      await this.testRunner.takeScreenshot('interaction-mode-status');
    });
  }

  async activatePanMode() {
    await this.testRunner.runTest('Activar modo pan', async () => {
      console.log('🔄 Intentando activar modo pan...');

      // Buscar y hacer clic en el botón de modo pan
      const snapshot = await this.testRunner.getPageSnapshot();

      try {
        // Intentar varios selectores posibles para el modo pan
        await this.testRunner.clickElement('button[title*="Pan"]', 'Botón Pan (title)');
      } catch (error) {
        try {
          await this.testRunner.clickElement('[data-mode="pan"]', 'Botón Pan (data-mode)');
        } catch (error2) {
          try {
            // Buscar botón que contenga texto "Pan"
            const content = snapshot.text_result[0].text;
            if (content.includes('✋')) {
              await this.testRunner.clickElement('✋', 'Botón Pan (emoji)');
            } else {
              console.log('⚠️ No se encontró botón de pan específico, intentando toggle');
              await this.testRunner.clickElement(this.config.selectors.dragMode, 'Toggle modo interacción');
            }
          } catch (error3) {
            console.log('⚠️ No se pudo encontrar botón de pan explícito');
          }
        }
      }

      await this.testRunner.wait(WAIT_TIMES.short);
      await this.testRunner.takeScreenshot('pan-mode-activated');
    });
  }

  async testPanEvents() {
    await this.testRunner.runTest('Diagnosticar eventos de pan', async () => {
      console.log('🎯 Probando eventos de pointer para pan...');

      // Obtener snapshot inicial
      const initialSnapshot = await this.testRunner.getPageSnapshot();

      // Intentar hacer drag en el área del canvas
      await this.performPanDrag();

      await this.testRunner.wait(WAIT_TIMES.short);

      // Obtener snapshot después del drag
      const afterDragSnapshot = await this.testRunner.getPageSnapshot();

      // Comparar contenido para ver si algo cambió
      const contentChanged = initialSnapshot.text_result[0].text !== afterDragSnapshot.text_result[0].text;

      if (contentChanged) {
        console.log('✅ Se detectaron cambios después del drag');
      } else {
        console.log('⚠️ No se detectaron cambios visibles después del drag');
      }

      await this.testRunner.takeScreenshot('after-pan-events');
    });
  }

  async performPanDrag() {
    console.log('🖱️ Realizando arrastre de pan...');

    try {
      // Intentar hacer drag en el área del canvas usando coordenadas
      await this.mcpTools.browser_action({
        action: 'drag',
        startX: 400,
        startY: 300,
        endX: 500,
        endY: 350,
        duration: 1000,
      });
    } catch (error) {
      console.log('⚠️ Drag con coordenadas falló, intentando con elemento...');

      try {
        // Intentar usando el selector del área del canvas
        await this.testRunner.clickElement(this.config.selectors.canvasArea, 'Área del canvas');
        await this.mcpTools.browser_action({
          action: 'mouse_move',
          x: 450,
          y: 325,
        });
      } catch (error2) {
        console.log('⚠️ No se pudo realizar drag automático');
      }
    }
  }

  async testActualPanDrag() {
    await this.testRunner.runTest('Prueba de arrastre real del diagrama', async () => {
      console.log('🎯 Probando arrastre real del diagrama...');

      // Tomar captura antes del drag
      await this.testRunner.takeScreenshot('before-real-drag');

      // Intentar múltiples métodos de drag
      await this.attemptVariousDragMethods();

      await this.testRunner.wait(WAIT_TIMES.medium);

      // Tomar captura después del drag
      await this.testRunner.takeScreenshot('after-real-drag');

      // Verificar si el diagrama se movió visualmente
      await this.verifyDiagramMovement();
    });
  }

  async attemptVariousDragMethods() {
    console.log('🔄 Intentando varios métodos de arrastre...');

    // Método 1: Drag directo en canvas
    try {
      await this.testRunner.clickElement(this.config.selectors.canvasArea, 'Canvas para drag');
      await this.testRunner.wait(500);

      // Simular movimiento con teclado como alternativa
      await this.testRunner.pressKey('ArrowRight');
      await this.testRunner.pressKey('ArrowRight');
      await this.testRunner.pressKey('ArrowDown');

      console.log('✅ Método teclado intentado');
    } catch (error) {
      console.log('⚠️ Método teclado falló:', error.message);
    }

    // Método 2: Usar controles de zoom y centro
    try {
      await this.testRunner.clickElement(this.config.selectors.zoomIn, 'Zoom in para mover');
      await this.testRunner.wait(500);
      await this.testRunner.clickElement(this.config.selectors.centerDiagram, 'Centrar diagrama');
      await this.testRunner.wait(500);

      console.log('✅ Método controles de zoom intentado');
    } catch (error) {
      console.log('⚠️ Método controles falló:', error.message);
    }
  }

  async verifyDiagramMovement() {
    console.log('🔍 Verificando si el diagrama se movió...');

    const snapshot = await this.testRunner.getPageSnapshot();
    const content = snapshot.text_result[0].text;

    // Buscar indicadores de movimiento o transformación
    const hasTransform = content.includes('transform') || content.includes('translate') || content.includes('matrix');
    const hasMovement = content.includes('moved') || content.includes('pan');

    if (hasTransform || hasMovement) {
      console.log('✅ Se detectaron indicios de transformación/movimiento');
    } else {
      console.log('❌ NO se detectó movimiento del diagrama');
    }

    return hasTransform || hasMovement;
  }

  async checkSVGTransformations() {
    await this.testRunner.runTest('Verificar transformaciones SVG', async () => {
      console.log('🔍 Analizando transformaciones SVG...');

      const snapshot = await this.testRunner.getPageSnapshot();
      const content = snapshot.text_result[0].text;

      // Buscar elementos SVG y sus transformaciones
      const hasSVG = content.includes('<svg') || content.includes('svg');
      const hasTransformAttr = content.includes('transform=') || content.includes('style="transform:');

      console.log(`SVG presente: ${hasSVG}`);
      console.log(`Transformaciones detectadas: ${hasTransformAttr}`);

      if (!hasSVG) {
        throw new Error('No se encontró elemento SVG en la página');
      }

      if (!hasTransformAttr) {
        console.log('⚠️ No se detectaron transformaciones en SVG - posible causa del problema de pan');
      } else {
        console.log('✅ Se encontraron transformaciones SVG');
      }

      await this.testRunner.takeScreenshot('svg-transformations-check');
    });
  }

  async runQuickPanTest() {
    console.log('⚡ PRUEBA RÁPIDA DE PAN');
    console.log('='.repeat(40));

    await this.testRunner.navigateToApp();
    await this.ensureDiagramExists();
    await this.activatePanMode();

    // Test rápido de drag
    console.log('🖱️ Realizando test rápido de drag...');
    await this.performPanDrag();
    await this.testRunner.wait(1000);

    const moved = await this.verifyDiagramMovement();

    if (moved) {
      console.log('✅ PAN FUNCIONA CORRECTAMENTE!');
    } else {
      console.log('❌ PAN NO FUNCIONA - Se necesita corrección');
    }

    return moved;
  }
}

// Función de ejecución rápida
export async function runPanDiagnostic(mcpTools) {
  const diagnostic = new PanDiagnosticTest(mcpTools);
  return await diagnostic.runPanDiagnostics();
}

export async function runQuickPanCheck(mcpTools) {
  const diagnostic = new PanDiagnosticTest(mcpTools);
  return await diagnostic.runQuickPanTest();
}
