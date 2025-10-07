import { MCPTestRunner } from './TestRunner.js';
import { TEST_CONFIG, WAIT_TIMES } from './config.js';

export class MermaidTestSuite {
  constructor(mcpTools) {
    this.testRunner = new MCPTestRunner(mcpTools);
    this.config = TEST_CONFIG;
  }

  async runAllTests() {
    console.log('🎯 Iniciando suite completa de pruebas para Mermaid Pro Viewer');

    await this.testRunner.initialize();

    // Pruebas básicas de interfaz
    await this.testBasicUI();

    // Pruebas del editor de código
    await this.testCodeEditor();

    // Pruebas de renderizado de diagramas
    await this.testDiagramRendering();

    // Pruebas de herramientas de canvas
    await this.testCanvasTools();

    // Pruebas de zoom y navegación
    await this.testZoomAndNavigation();

    // Pruebas de temas
    await this.testThemeToggle();

    // Pruebas de ejemplos
    await this.testDiagramExamples();

    return this.testRunner.generateReport();
  }

  async testBasicUI() {
    console.log('\n🧩 === PRUEBAS DE INTERFAZ BÁSICA ===');

    await this.testRunner.runTest('Verificar elementos principales de la interfaz', async () => {
      // Verificar título
      await this.testRunner.validateTextContent('Mermaid Visualizer Pro', 'Título principal');

      // Verificar elementos del toolbar
      await this.testRunner.validateElement(this.config.selectors.menuToggle, 'Botón de menú');
      await this.testRunner.validateElement(this.config.selectors.diagramTab, 'Tab de Diagrama');
      await this.testRunner.validateElement(this.config.selectors.whiteboardTab, 'Tab de Whiteboard');
      await this.testRunner.validateElement(this.config.selectors.openButton, 'Botón Abrir');
      await this.testRunner.validateElement(this.config.selectors.saveButton, 'Botón Guardar');
      await this.testRunner.validateElement(this.config.selectors.themeToggle, 'Toggle de tema');
    });

    await this.testRunner.runTest('Verificar elementos del editor', async () => {
      // Verificar editor de código
      await this.testRunner.validateElement(this.config.selectors.codeEditor, 'Editor de código');
      await this.testRunner.validateTextContent('Mermaid Code Editor', 'Título del editor');

      // Verificar botón de ejemplos
      await this.testRunner.validateElement(this.config.selectors.diagramExamples, 'Botón de ejemplos');
    });

    await this.testRunner.runTest('Verificar herramientas del canvas', async () => {
      // Verificar herramientas de canvas
      await this.testRunner.validateElement(this.config.selectors.addShape, 'Botón añadir forma');
      await this.testRunner.validateElement(this.config.selectors.addImage, 'Botón añadir imagen');
      await this.testRunner.validateElement(this.config.selectors.addText, 'Botón añadir texto');
      await this.testRunner.validateElement(this.config.selectors.zoomIn, 'Botón zoom in');
      await this.testRunner.validateElement(this.config.selectors.zoomOut, 'Botón zoom out');
      await this.testRunner.validateElement(this.config.selectors.resetZoom, 'Botón reset zoom');
    });
  }

  async testCodeEditor() {
    console.log('\n📝 === PRUEBAS DEL EDITOR DE CÓDIGO ===');

    await this.testRunner.runTest('Limpiar y escribir código simple', async () => {
      // Limpiar editor
      await this.testRunner.clickElement(this.config.selectors.codeEditor, 'Editor de código');
      await this.testRunner.pressKey('Control+a');
      await this.testRunner.pressKey('Delete');

      // Escribir código simple
      await this.testRunner.typeText(
        this.config.selectors.codeEditor,
        this.config.testData.simpleDiagram,
        'Editor de código'
      );

      await this.testRunner.wait(WAIT_TIMES.medium);
    });

    await this.testRunner.runTest('Verificar actualización de contador de líneas', async () => {
      await this.testRunner.validateTextContent('Lines:', 'Contador de líneas');
      await this.testRunner.validateTextContent('Characters:', 'Contador de caracteres');
    });
  }

  async testDiagramRendering() {
    console.log('\n🎨 === PRUEBAS DE RENDERIZADO ===');

    await this.testRunner.runTest('Esperar renderizado del diagrama simple', async () => {
      await this.testRunner.waitForDiagramRender();
      await this.testRunner.validateElement(this.config.selectors.diagramImage, 'Imagen del diagrama');
      await this.testRunner.takeScreenshot('simple-diagram-rendered');
    });

    await this.testRunner.runTest('Probar diagrama complejo', async () => {
      // Cambiar a diagrama complejo
      await this.testRunner.clickElement(this.config.selectors.codeEditor, 'Editor de código');
      await this.testRunner.pressKey('Control+a');

      await this.testRunner.typeText(
        this.config.selectors.codeEditor,
        this.config.testData.complexDiagram,
        'Editor de código'
      );

      await this.testRunner.waitForDiagramRender();
      await this.testRunner.takeScreenshot('complex-diagram-rendered');
    });

    await this.testRunner.runTest('Probar diagrama de flujo', async () => {
      // Cambiar a flowchart
      await this.testRunner.clickElement(this.config.selectors.codeEditor, 'Editor de código');
      await this.testRunner.pressKey('Control+a');

      await this.testRunner.typeText(
        this.config.selectors.codeEditor,
        this.config.testData.flowchartDiagram,
        'Editor de código'
      );

      await this.testRunner.waitForDiagramRender();
      await this.testRunner.takeScreenshot('flowchart-rendered');
    });
  }

  async testCanvasTools() {
    console.log('\n🛠️  === PRUEBAS DE HERRAMIENTAS DE CANVAS ===');

    await this.testRunner.runTest('Probar modo arrastre', async () => {
      await this.testRunner.clickElement(this.config.selectors.dragMode, 'Modo arrastre');
      await this.testRunner.wait(WAIT_TIMES.short);

      // Verificar que el botón cambió (debería mostrar diferente estado)
      const snapshot = await this.testRunner.getPageSnapshot();
      // El modo de arrastre debería estar activo ahora
    });

    await this.testRunner.runTest('Probar herramientas de añadir elementos', async () => {
      await this.testRunner.clickElement(this.config.selectors.addShape, 'Añadir forma');
      await this.testRunner.wait(WAIT_TIMES.short);

      await this.testRunner.clickElement(this.config.selectors.addImage, 'Añadir imagen');
      await this.testRunner.wait(WAIT_TIMES.short);

      await this.testRunner.clickElement(this.config.selectors.addText, 'Añadir texto');
      await this.testRunner.wait(WAIT_TIMES.short);

      await this.testRunner.clickElement(this.config.selectors.addIcon, 'Añadir icono');
      await this.testRunner.wait(WAIT_TIMES.short);
    });

    await this.testRunner.runTest('Probar botón de centrar diagrama', async () => {
      await this.testRunner.clickElement(this.config.selectors.centerDiagram, 'Centrar diagrama');
      await this.testRunner.wait(WAIT_TIMES.short);
      await this.testRunner.takeScreenshot('diagram-centered');
    });
  }

  async testZoomAndNavigation() {
    console.log('\n🔍 === PRUEBAS DE ZOOM Y NAVEGACIÓN ===');

    await this.testRunner.runTest('Probar zoom in', async () => {
      await this.testRunner.clickElement(this.config.selectors.zoomIn, 'Zoom in');
      await this.testRunner.wait(WAIT_TIMES.short);
      await this.testRunner.takeScreenshot('zoomed-in');

      // Verificar que el porcentaje de zoom cambió
      await this.testRunner.validateTextContent('%', 'Porcentaje de zoom');
    });

    await this.testRunner.runTest('Probar zoom out', async () => {
      await this.testRunner.clickElement(this.config.selectors.zoomOut, 'Zoom out');
      await this.testRunner.wait(WAIT_TIMES.short);
      await this.testRunner.takeScreenshot('zoomed-out');
    });

    await this.testRunner.runTest('Probar reset zoom', async () => {
      await this.testRunner.clickElement(this.config.selectors.resetZoom, 'Reset zoom');
      await this.testRunner.wait(WAIT_TIMES.short);
      await this.testRunner.takeScreenshot('zoom-reset');
    });

    await this.testRunner.runTest('Probar zoom múltiple', async () => {
      // Hacer varios zooms
      for (let i = 0; i < 3; i++) {
        await this.testRunner.clickElement(this.config.selectors.zoomIn, 'Zoom in múltiple');
        await this.testRunner.wait(500);
      }

      await this.testRunner.takeScreenshot('multiple-zoom-in');

      // Reset
      await this.testRunner.clickElement(this.config.selectors.resetZoom, 'Reset después de zoom múltiple');
      await this.testRunner.wait(WAIT_TIMES.short);
    });
  }

  async testThemeToggle() {
    console.log('\n🌙 === PRUEBAS DE TEMAS ===');

    await this.testRunner.runTest('Cambiar a tema oscuro', async () => {
      await this.testRunner.clickElement(this.config.selectors.themeToggle, 'Toggle tema oscuro');
      await this.testRunner.wait(WAIT_TIMES.medium);
      await this.testRunner.takeScreenshot('dark-theme');
    });

    await this.testRunner.runTest('Volver a tema claro', async () => {
      await this.testRunner.clickElement(this.config.selectors.themeToggle, 'Toggle tema claro');
      await this.testRunner.wait(WAIT_TIMES.medium);
      await this.testRunner.takeScreenshot('light-theme');
    });
  }

  async testDiagramExamples() {
    console.log('\n📚 === PRUEBAS DE EJEMPLOS ===');

    await this.testRunner.runTest('Abrir menú de ejemplos', async () => {
      await this.testRunner.clickElement(this.config.selectors.diagramExamples, 'Menú de ejemplos');
      await this.testRunner.wait(WAIT_TIMES.medium);
      await this.testRunner.takeScreenshot('examples-menu-opened');
    });
  }

  async testTabNavigation() {
    console.log('\n📑 === PRUEBAS DE NAVEGACIÓN ENTRE TABS ===');

    await this.testRunner.runTest('Cambiar a tab Whiteboard', async () => {
      await this.testRunner.clickElement(this.config.selectors.whiteboardTab, 'Tab Whiteboard');
      await this.testRunner.wait(WAIT_TIMES.medium);
      await this.testRunner.takeScreenshot('whiteboard-tab');
    });

    await this.testRunner.runTest('Volver a tab Diagram', async () => {
      await this.testRunner.clickElement(this.config.selectors.diagramTab, 'Tab Diagram');
      await this.testRunner.wait(WAIT_TIMES.medium);
      await this.testRunner.takeScreenshot('diagram-tab');
    });
  }

  async testResponsiveness() {
    console.log('\n📱 === PRUEBAS DE RESPONSIVIDAD ===');

    await this.testRunner.runTest('Probar menú hamburguesa', async () => {
      await this.testRunner.clickElement(this.config.selectors.menuToggle, 'Menú hamburguesa');
      await this.testRunner.wait(WAIT_TIMES.short);
      await this.testRunner.takeScreenshot('menu-toggled');

      // Cerrar menú
      await this.testRunner.clickElement(this.config.selectors.menuToggle, 'Cerrar menú');
      await this.testRunner.wait(WAIT_TIMES.short);
    });
  }
}
