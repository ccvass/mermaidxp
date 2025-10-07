import { TEST_CONFIG, WAIT_TIMES } from './config.js';

export class MCPTestRunner {
  constructor(mcpTools) {
    this.mcpTools = mcpTools;
    this.config = TEST_CONFIG;
    this.currentTest = null;
    this.testResults = [];
    this.screenshots = [];
  }

  async initialize() {
    console.log('🚀 Inicializando MCP Test Runner...');
    await this.navigateToApp();
    await this.takeScreenshot('initial-state');
    console.log('✅ Test Runner inicializado');
  }

  async navigateToApp() {
    console.log(`📍 Navegando a ${this.config.baseUrl}`);
    await this.mcpTools.browser_navigate({ url: this.config.baseUrl });
    await this.wait(WAIT_TIMES.medium);
  }

  async wait(ms) {
    console.log(`⏳ Esperando ${ms}ms...`);
    await this.mcpTools.browser_wait({ time: ms / 1000 });
  }

  async takeScreenshot(name) {
    if (this.config.screenshots.enabled) {
      console.log(`📸 Tomando captura: ${name}`);
      const result = await this.mcpTools.browser_screenshot();
      this.screenshots.push({ name, timestamp: new Date().toISOString(), result });
      return result;
    }
  }

  async getPageSnapshot() {
    console.log('📋 Obteniendo snapshot de la página...');
    return await this.mcpTools.browser_snapshot();
  }

  async clickElement(ref, description) {
    console.log(`🖱️  Haciendo click en: ${description}`);
    await this.mcpTools.browser_click({
      element: description,
      ref: ref,
    });
    await this.wait(WAIT_TIMES.short);
  }

  async typeText(ref, text, description, submit = false) {
    console.log(`⌨️  Escribiendo en ${description}: "${text.substring(0, 50)}..."`);
    await this.mcpTools.browser_type({
      element: description,
      ref: ref,
      text: text,
      submit: submit,
    });
    await this.wait(WAIT_TIMES.short);
  }

  async hoverElement(ref, description) {
    console.log(`🔍 Hover sobre: ${description}`);
    await this.mcpTools.browser_hover({
      element: description,
      ref: ref,
    });
    await this.wait(WAIT_TIMES.short);
  }

  async pressKey(key) {
    console.log(`⌨️  Presionando tecla: ${key}`);
    await this.mcpTools.browser_press_key({ key: key });
    await this.wait(WAIT_TIMES.short);
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Ejecutando prueba: ${testName}`);
    this.currentTest = {
      name: testName,
      startTime: new Date(),
      status: 'running',
    };

    try {
      await testFunction();
      this.currentTest.status = 'passed';
      this.currentTest.endTime = new Date();
      console.log(`✅ Prueba EXITOSA: ${testName}`);

      if (this.config.screenshots.onSuccess) {
        await this.takeScreenshot(`${testName}-success`);
      }
    } catch (error) {
      this.currentTest.status = 'failed';
      this.currentTest.error = error.message;
      this.currentTest.endTime = new Date();
      console.log(`❌ Prueba FALLIDA: ${testName} - ${error.message}`);

      if (this.config.screenshots.onFailure) {
        await this.takeScreenshot(`${testName}-failure`);
      }
    }

    this.testResults.push({ ...this.currentTest });
    return this.currentTest.status === 'passed';
  }

  async validateElement(ref, description, shouldExist = true) {
    const snapshot = await this.getPageSnapshot();
    const elementExists = snapshot.text_result[0].text.includes(ref);

    if (shouldExist && !elementExists) {
      throw new Error(`Elemento no encontrado: ${description} (ref: ${ref})`);
    }

    if (!shouldExist && elementExists) {
      throw new Error(`Elemento inesperado encontrado: ${description} (ref: ${ref})`);
    }

    console.log(`✅ Validación exitosa: ${description}`);
    return true;
  }

  async validateTextContent(expectedText, description) {
    const snapshot = await this.getPageSnapshot();
    const pageContent = snapshot.text_result[0].text;

    if (!pageContent.includes(expectedText)) {
      throw new Error(`Texto no encontrado: "${expectedText}" en ${description}`);
    }

    console.log(`✅ Texto validado: ${description}`);
    return true;
  }

  async waitForElementToAppear(ref, description, maxWaitTime = WAIT_TIMES.long) {
    console.log(`⏳ Esperando que aparezca: ${description}`);
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        await this.validateElement(ref, description, true);
        console.log(`✅ Elemento apareció: ${description}`);
        return true;
      } catch (error) {
        await this.wait(500);
      }
    }

    throw new Error(`Timeout esperando elemento: ${description}`);
  }

  async waitForDiagramRender(maxWaitTime = WAIT_TIMES.render) {
    console.log('⏳ Esperando renderizado del diagrama...');
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const snapshot = await this.getPageSnapshot();
      const content = snapshot.text_result[0].text;

      // Check if diagram is no longer loading
      if (!content.includes('Loading') && !content.includes('Rendering...')) {
        console.log('✅ Diagrama renderizado');
        return true;
      }

      await this.wait(1000);
    }

    throw new Error('Timeout esperando renderizado del diagrama');
  }

  generateReport() {
    const passed = this.testResults.filter((t) => t.status === 'passed').length;
    const failed = this.testResults.filter((t) => t.status === 'failed').length;
    const total = this.testResults.length;

    console.log('\n📊 REPORTE DE PRUEBAS');
    console.log('='.repeat(50));
    console.log(`Total de pruebas: ${total}`);
    console.log(`✅ Exitosas: ${passed}`);
    console.log(`❌ Fallidas: ${failed}`);
    console.log(`📈 Porcentaje de éxito: ${((passed / total) * 100).toFixed(2)}%`);

    if (failed > 0) {
      console.log('\n❌ PRUEBAS FALLIDAS:');
      this.testResults
        .filter((t) => t.status === 'failed')
        .forEach((test) => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }

    console.log('\n📸 CAPTURAS TOMADAS:', this.screenshots.length);

    return {
      total,
      passed,
      failed,
      successRate: (passed / total) * 100,
      results: this.testResults,
      screenshots: this.screenshots,
    };
  }
}
