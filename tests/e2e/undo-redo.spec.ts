import { test, expect } from '@playwright/test';

test.describe('Undo/Redo System', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('/');

    // Esperar a que la aplicación cargue
    await page.waitForSelector('.CodeMirror, textarea', { timeout: 10000 });
  });

  test('should enable undo button after making a change', async ({ page }) => {
    // Encontrar el editor de código (puede ser textarea o CodeMirror)
    const editorSelector = (await page.locator('textarea').first().isVisible()) ? 'textarea' : '.CodeMirror';

    // Obtener el código inicial
    let initialCode;
    if (editorSelector === 'textarea') {
      initialCode = await page.locator('textarea').first().inputValue();
    } else {
      initialCode = await page.evaluate(() => {
        const cm = document.querySelector('.CodeMirror')?.CodeMirror;
        return cm ? cm.getValue() : '';
      });
    }

    console.log('Initial code length:', initialCode.length);

    // Verificar que el botón de undo esté deshabilitado inicialmente
    const undoButton = page.locator('button[title*="Undo"]').first();
    await expect(undoButton).toBeDisabled();

    // Hacer un cambio en el código
    const newCode = 'graph LR\n    A[Test] --> B[Node]';

    if (editorSelector === 'textarea') {
      await page.locator('textarea').first().fill(newCode);
    } else {
      await page.evaluate((code) => {
        const cm = document.querySelector('.CodeMirror')?.CodeMirror;
        if (cm) cm.setValue(code);
      }, newCode);
    }

    // Esperar 1.5 segundos para que el debounce guarde el cambio
    await page.waitForTimeout(1500);

    // Verificar que el botón de undo ahora esté habilitado
    await expect(undoButton).toBeEnabled();
  });

  test('should undo and redo changes correctly', async ({ page }) => {
    const editorSelector = (await page.locator('textarea').first().isVisible()) ? 'textarea' : '.CodeMirror';

    // Obtener el código inicial
    let initialCode;
    if (editorSelector === 'textarea') {
      initialCode = await page.locator('textarea').first().inputValue();
    } else {
      initialCode = await page.evaluate(() => {
        const cm = document.querySelector('.CodeMirror')?.CodeMirror;
        return cm ? cm.getValue() : '';
      });
    }

    // Hacer un cambio
    const newCode = 'graph TB\n    X[Changed] --> Y[Diagram]';

    if (editorSelector === 'textarea') {
      await page.locator('textarea').first().fill(newCode);
    } else {
      await page.evaluate((code) => {
        const cm = document.querySelector('.CodeMirror')?.CodeMirror;
        if (cm) cm.setValue(code);
      }, newCode);
    }

    // Esperar el debounce
    await page.waitForTimeout(1500);

    // Hacer undo con Ctrl+Z
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    // Verificar que el código volvió al inicial
    let currentCode;
    if (editorSelector === 'textarea') {
      currentCode = await page.locator('textarea').first().inputValue();
    } else {
      currentCode = await page.evaluate(() => {
        const cm = document.querySelector('.CodeMirror')?.CodeMirror;
        return cm ? cm.getValue() : '';
      });
    }

    expect(currentCode).toBe(initialCode);

    // Hacer redo con Ctrl+Y
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);

    // Verificar que el código volvió al cambio
    if (editorSelector === 'textarea') {
      currentCode = await page.locator('textarea').first().inputValue();
    } else {
      currentCode = await page.evaluate(() => {
        const cm = document.querySelector('.CodeMirror')?.CodeMirror;
        return cm ? cm.getValue() : '';
      });
    }

    expect(currentCode).toBe(newCode);
  });

  test('should show correct history count in debug panel', async ({ page }) => {
    // Verificar que el panel de debug existe
    const debugPanel = page.locator('[data-testid="undo-redo-debug-panel"]');
    await expect(debugPanel).toBeVisible();

    // Verificar el estado inicial
    await expect(page.locator('text=History: 1/1')).toBeVisible();
    await expect(page.locator('text=Can Undo: ❌')).toBeVisible();

    // Hacer un cambio
    const editorSelector = (await page.locator('textarea').first().isVisible()) ? 'textarea' : '.CodeMirror';

    const testCode = 'graph LR\n    Test1 --> Test2';

    if (editorSelector === 'textarea') {
      await page.locator('textarea').first().fill(testCode);
    } else {
      await page.evaluate((code) => {
        const cm = document.querySelector('.CodeMirror')?.CodeMirror;
        if (cm) cm.setValue(code);
      }, testCode);
    }

    // Esperar el debounce
    await page.waitForTimeout(1500);

    // Verificar que el historial se actualizó
    await expect(page.locator('text=History: 2/2')).toBeVisible();
    await expect(page.locator('text=Can Undo: ✅')).toBeVisible();
  });

  test('should work with toolbar buttons', async ({ page }) => {
    // Hacer un cambio primero
    const editorSelector = (await page.locator('textarea').first().isVisible()) ? 'textarea' : '.CodeMirror';

    const testCode = 'flowchart TD\n    Start --> End';

    if (editorSelector === 'textarea') {
      await page.locator('textarea').first().fill(testCode);
    } else {
      await page.evaluate((code) => {
        const cm = document.querySelector('.CodeMirror')?.CodeMirror;
        if (cm) cm.setValue(code);
      }, testCode);
    }

    // Esperar el debounce
    await page.waitForTimeout(1500);

    // Click en el botón de undo del toolbar
    const undoButton = page.locator('button[title*="Undo"]').first();
    await undoButton.click();

    // Esperar un momento
    await page.waitForTimeout(500);

    // Verificar que aparece la notificación
    await expect(page.locator('text=↶ Cambio deshecho')).toBeVisible();

    // Click en el botón de redo
    const redoButton = page.locator('button[title*="Redo"]').first();
    await redoButton.click();

    // Verificar la notificación de redo
    await expect(page.locator('text=↷ Cambio rehecho')).toBeVisible();
  });
});
