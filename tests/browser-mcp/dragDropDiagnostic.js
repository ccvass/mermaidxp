/**
 * Script de Diagnóstico Avanzado para Drag and Drop
 * Este script identifica problemas específicos con la funcionalidad de arrastre
 */

export async function diagnoseDragDropIssues(mcpTools) {
  console.log('🔍 === DIAGNÓSTICO AVANZADO DE DRAG AND DROP ===');

  const issues = [];
  const successes = [];

  try {
    // 1. Verificar estado inicial
    console.log('\\n📋 Paso 1: Verificando estado inicial...');
    await mcpTools.browser_navigate({ url: 'http://localhost:3000' });
    await mcpTools.browser_wait({ time: 5 });

    const initialSnapshot = await mcpTools.browser_snapshot();
    const initialContent = initialSnapshot.text_result[0].text;

    // Verificar si el diagrama está renderizado
    if (initialContent.includes('Loading') || initialContent.includes('Rendering...')) {
      issues.push('❌ Diagrama no completamente renderizado');

      // Esperar más tiempo
      console.log('⏳ Esperando renderizado completo...');
      let attempts = 0;
      while (attempts < 10) {
        await mcpTools.browser_wait({ time: 2 });
        const checkSnapshot = await mcpTools.browser_snapshot();
        const checkContent = checkSnapshot.text_result[0].text;

        if (!checkContent.includes('Loading') && !checkContent.includes('Rendering...')) {
          successes.push('✅ Diagrama finalmente renderizado');
          break;
        }
        attempts++;
      }

      if (attempts >= 10) {
        issues.push('❌ CRÍTICO: Diagrama nunca completó el renderizado');
        return { issues, successes, critical: true };
      }
    } else {
      successes.push('✅ Diagrama renderizado correctamente desde el inicio');
    }

    // 2. Verificar elementos del diagrama
    console.log('\\n🎯 Paso 2: Verificando elementos del diagrama...');
    const finalSnapshot = await mcpTools.browser_snapshot();
    const finalContent = finalSnapshot.text_result[0].text;

    // Buscar elementos esperados
    const expectedElements = ['Start', 'Is it?', 'OK', 'End', 'Find Solution', 'Give Up!'];

    const foundElements = [];
    const missingElements = [];

    for (const element of expectedElements) {
      if (finalContent.includes(element)) {
        foundElements.push(element);
      } else {
        missingElements.push(element);
      }
    }

    if (foundElements.length > 0) {
      successes.push(`✅ Elementos encontrados: ${foundElements.join(', ')}`);
    }

    if (missingElements.length > 0) {
      issues.push(`❌ Elementos faltantes: ${missingElements.join(', ')}`);
    }

    // 3. Verificar botón de drag mode
    console.log('\\n🖱️  Paso 3: Verificando botón de drag mode...');
    if (finalContent.includes('Switch to Drag Mode')) {
      successes.push('✅ Botón "Switch to Drag Mode" presente');

      // Intentar extraer su referencia
      const dragButtonRef = extractReference(finalContent, 'Switch to Drag Mode');
      if (dragButtonRef) {
        successes.push(`✅ Referencia del botón drag: ${dragButtonRef}`);
      } else {
        issues.push('❌ No se pudo extraer referencia del botón drag');
      }
    } else {
      issues.push('❌ Botón "Switch to Drag Mode" NO encontrado');
    }

    // 4. Obtener logs de consola para errores
    console.log('\\n📝 Paso 4: Revisando logs de consola...');
    const consoleLogs = await mcpTools.browser_get_console_logs();

    if (consoleLogs.logs && consoleLogs.logs.length > 0) {
      const errorLogs = consoleLogs.logs.filter(
        (log) => log.type === 'error' || log.message.toLowerCase().includes('error')
      );

      if (errorLogs.length > 0) {
        issues.push(`❌ Errores en consola detectados: ${errorLogs.length}`);
        errorLogs.forEach((log) => {
          issues.push(`   📍 ${log.message}`);
        });
      } else {
        successes.push('✅ No hay errores críticos en consola');
      }

      // Buscar logs específicos de drag and drop
      const dragLogs = consoleLogs.logs.filter(
        (log) => log.message.includes('draggable') || log.message.includes('drag') || log.message.includes('Marked')
      );

      if (dragLogs.length > 0) {
        successes.push(`✅ Logs de drag detectados: ${dragLogs.length}`);
        dragLogs.forEach((log) => {
          successes.push(`   🎯 ${log.message}`);
        });
      } else {
        issues.push('❌ No hay logs de inicialización de drag and drop');
      }
    } else {
      issues.push('❌ No se pudieron obtener logs de consola');
    }

    // 5. Verificar estructura del SVG
    console.log('\\n🎨 Paso 5: Verificando estructura SVG...');
    if (finalContent.includes('document [ref=')) {
      const documentRefs = extractAllDocumentRefs(finalContent);
      if (documentRefs.length > 0) {
        successes.push(`✅ Documentos SVG encontrados: ${documentRefs.length}`);
      } else {
        issues.push('❌ No se encontraron referencias de documento SVG');
      }
    }

    // 6. Verificar tips de interacción
    console.log('\\n💡 Paso 6: Verificando tips de interacción...');
    if (finalContent.includes('Click and drag to pan')) {
      successes.push('✅ Tips de drag and pan presentes');
    } else {
      issues.push('❌ Tips de interacción faltantes');
    }

    if (finalContent.includes('Switch to Drag mode to move individual elements')) {
      successes.push('✅ Tips de drag mode presentes');
    } else {
      issues.push('❌ Tips de drag mode faltantes');
    }

    return {
      issues,
      successes,
      critical: issues.some((issue) => issue.includes('CRÍTICO')),
      summary: {
        totalIssues: issues.length,
        totalSuccesses: successes.length,
        diagnosisComplete: true,
      },
    };
  } catch (error) {
    issues.push(`❌ ERROR FATAL durante diagnóstico: ${error.message}`);
    return {
      issues,
      successes,
      critical: true,
      error: error.message,
    };
  }
}

// Función para extraer referencias de elementos
function extractReference(content, elementText) {
  const lines = content.split('\\n');
  for (const line of lines) {
    if (line.includes(elementText) && line.includes('[ref=')) {
      const match = line.match(/\\[ref=([^\\]]+)\\]/);
      if (match) {
        return match[1];
      }
    }
  }
  return null;
}

// Función para extraer todas las referencias de documento
function extractAllDocumentRefs(content) {
  const refs = [];
  const lines = content.split('\\n');

  for (const line of lines) {
    if (line.includes('document [ref=')) {
      const match = line.match(/document \\[ref=([^\\]]+)\\]/);
      if (match) {
        refs.push(match[1]);
      }
    }
  }

  return refs;
}

// Función para generar reporte de diagnóstico
export function generateDragDropReport(diagnosis) {
  console.log('\\n' + '='.repeat(60));
  console.log('📊 REPORTE DE DIAGNÓSTICO DRAG & DROP');
  console.log('='.repeat(60));

  if (diagnosis.critical) {
    console.log('🚨 ¡PROBLEMAS CRÍTICOS DETECTADOS!');
  }

  console.log(`\\n✅ ASPECTOS FUNCIONANDO (${diagnosis.successes.length}):`);
  diagnosis.successes.forEach((success) => console.log(`  ${success}`));

  console.log(`\\n❌ PROBLEMAS DETECTADOS (${diagnosis.issues.length}):`);
  diagnosis.issues.forEach((issue) => console.log(`  ${issue}`));

  console.log('\\n🔧 RECOMENDACIONES DE CORRECCIÓN:');

  if (diagnosis.issues.some((issue) => issue.includes('Diagrama no completamente renderizado'))) {
    console.log('  1. ⚠️  Incrementar tiempo de espera para renderizado');
    console.log('  2. 🔄 Verificar configuración de Mermaid');
  }

  if (diagnosis.issues.some((issue) => issue.includes('Switch to Drag Mode'))) {
    console.log('  3. 🖱️  Verificar implementación del botón drag mode');
    console.log('  4. 🎯 Revisar event handlers del drag mode');
  }

  if (diagnosis.issues.some((issue) => issue.includes('logs de inicialización'))) {
    console.log('  5. 📝 Verificar inicialización de drag and drop listeners');
    console.log('  6. 🔧 Revisar función markDraggableElements()');
  }

  if (diagnosis.issues.some((issue) => issue.includes('Errores en consola'))) {
    console.log('  7. 🐛 Resolver errores JavaScript en consola');
    console.log('  8. 🛠️  Verificar dependencias y imports');
  }

  console.log('\\n' + '='.repeat(60));

  return {
    score: Math.round((diagnosis.successes.length / (diagnosis.successes.length + diagnosis.issues.length)) * 100),
    status: diagnosis.critical
      ? 'CRÍTICO'
      : diagnosis.issues.length > diagnosis.successes.length
        ? 'PROBLEMÁTICO'
        : 'FUNCIONAL',
    priority: diagnosis.critical ? 'ALTA' : 'MEDIA',
  };
}

// Función para sugerir correcciones específicas
export function suggestFixes(diagnosis) {
  const fixes = [];

  if (diagnosis.issues.some((issue) => issue.includes('renderizado'))) {
    fixes.push({
      category: 'Renderizado',
      priority: 'Alta',
      description: 'Problemas con el renderizado del diagrama',
      fixes: [
        'Verificar que mermaidService.render() funciona correctamente',
        'Revisar configuración de timeouts',
        'Validar código Mermaid syntax',
      ],
    });
  }

  if (diagnosis.issues.some((issue) => issue.includes('drag'))) {
    fixes.push({
      category: 'Drag and Drop',
      priority: 'Alta',
      description: 'Funcionalidad de arrastre no funciona',
      fixes: [
        'Verificar implementación de useDragAndDrop hook',
        'Revisar event listeners en elementos SVG',
        'Validar transform calculations',
        'Verificar que isDragMode state funciona',
      ],
    });
  }

  if (diagnosis.issues.some((issue) => issue.includes('consola'))) {
    fixes.push({
      category: 'Errores JavaScript',
      priority: 'Media',
      description: 'Errores en consola del navegador',
      fixes: ['Revisar imports y dependencias', 'Validar tipos TypeScript', 'Verificar event handlers'],
    });
  }

  return fixes;
}
