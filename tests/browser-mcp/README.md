# 🧪 Sistema de Pruebas Automatizadas con MCP Browser

Este directorio contiene un sistema completo de pruebas automatizadas para el **Mermaid Pro Viewer** utilizando las herramientas **MCP Browser Tools**.

## 🎯 Características

- ✅ **Pruebas de Interfaz Completas**: Validación de todos los elementos UI
- 🎨 **Pruebas de Renderizado**: Verificación del renderizado de diagramas Mermaid
- 🔍 **Pruebas de Zoom y Navegación**: Testing de herramientas de canvas
- 🌙 **Pruebas de Temas**: Cambio entre tema claro y oscuro
- 📸 **Capturas Automáticas**: Screenshots de cada paso importante
- 📊 **Reportes Detallados**: Métricas completas de las pruebas
- ⚡ **Pruebas de Rendimiento**: Medición de tiempos de carga y renderizado

## 📁 Estructura de Archivos

```
tests/browser-mcp/
├── README.md              # Este archivo
├── config.js              # Configuración de pruebas
├── TestRunner.js          # Clase base para ejecutar pruebas
├── MermaidTests.js        # Suite completa de pruebas
├── demo.js               # Demo de pruebas MCP
└── runTests.js           # Script principal de ejecución
```

## 🚀 Uso Rápido

### 1. Demo Básico (Ejecutar ahora)

Puedes ejecutar un demo inmediatamente usando las herramientas MCP:

```javascript
// El agente puede ejecutar esto directamente
import { runMCPDemo } from './demo.js';

// Las herramientas MCP ya están disponibles en el contexto del agente
const result = await runMCPDemo({
  browser_navigate,
  browser_screenshot,
  browser_snapshot,
  browser_click,
  browser_type,
  browser_wait,
  browser_press_key,
});
```

### 2. Suite Completa de Pruebas

```javascript
import { MermaidTestSuite } from './MermaidTests.js';

const testSuite = new MermaidTestSuite(mcpTools);
const report = await testSuite.runAllTests();
```

### 3. Usar el Controlador Principal

```javascript
import { MCPTestController } from './runTests.js';

const controller = new MCPTestController();
controller.initializeWithRealTools(mcpTools);
const report = await controller.runAllTests();
```

## 🧪 Tipos de Pruebas Disponibles

### Pruebas Básicas de UI

- Verificación de elementos principales
- Validación de toolbar y menús
- Comprobación de editor de código

### Pruebas del Editor

- Edición de código Mermaid
- Limpieza y escritura de texto
- Validación de contadores

### Pruebas de Renderizado

- Diagramas simples
- Diagramas complejos
- Flowcharts
- Tiempo de renderizado

### Pruebas de Canvas

- Herramientas de dibujo
- Modo de arrastre
- Centrado de diagrama

### Pruebas de Zoom y Navegación

- Zoom in/out
- Reset de zoom
- Zoom múltiple

### Pruebas de Temas

- Cambio a tema oscuro
- Vuelta a tema claro

### Pruebas de Ejemplos

- Apertura de menú
- Selección de ejemplos

## 📊 Reportes de Pruebas

Cada ejecución genera un reporte completo con:

- **Total de pruebas ejecutadas**
- **Número de pruebas exitosas/fallidas**
- **Tasa de éxito en porcentaje**
- **Detalles de pruebas fallidas**
- **Número de capturas tomadas**
- **Duración total de ejecución**

## 🛠️ Configuración

### Selectores de Elementos

Los selectores se configuran en `config.js`:

```javascript
selectors: {
  codeEditor: 's1e44',
  diagramExamples: 's1e72',
  zoomIn: 's1e98',
  // ... más selectores
}
```

### Datos de Prueba

Los diagramas de prueba están predefinidos:

```javascript
testData: {
  simpleDiagram: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]`,
  // ... más diagramas
}
```

## 📸 Capturas de Pantalla

Las capturas se toman automáticamente en:

- Estado inicial
- Después de cada renderizado
- Cambios de tema
- Pruebas fallidas (configurable)

## ⚡ Optimizaciones de Rendimiento

- **Tiempos de espera inteligentes**: Esperamos solo lo necesario
- **Validación rápida**: Snapshots eficientes para validar elementos
- **Capturas condicionales**: Solo cuando es necesario
- **Reutilización de estado**: No reiniciamos la página innecesariamente

## 🐛 Manejo de Errores

- **Timeout automático**: Para elementos que no aparecen
- **Retry logic**: Reintentos automáticos en fallos temporales
- **Screenshots de fallos**: Captura automática cuando algo falla
- **Logs detallados**: Información completa para debugging

## 📋 Checklist de Pruebas

### ✅ Funcionalidad Básica

- [x] Carga inicial de la aplicación
- [x] Elementos UI presentes
- [x] Editor de código funcional
- [x] Renderizado de diagramas

### ✅ Interacciones

- [x] Click en botones
- [x] Escritura en editor
- [x] Navegación entre tabs
- [x] Zoom in/out/reset

### ✅ Características Avanzadas

- [x] Cambio de temas
- [x] Menú de ejemplos
- [x] Herramientas de canvas
- [x] Modo de arrastre

## 🚦 Estados de Prueba

- **🟢 PASSED**: Prueba ejecutada exitosamente
- **🔴 FAILED**: Prueba falló con error específico
- **🟡 RUNNING**: Prueba en ejecución
- **⏳ TIMEOUT**: Prueba excedió tiempo límite

## 💡 Consejos de Uso

1. **Asegúrate de que la aplicación esté corriendo** en localhost:3000
2. **Verifica los selectores** si la UI cambia
3. **Ajusta los timeouts** según la velocidad de tu sistema
4. **Revisa las capturas** para debugging visual
5. **Usa el demo** primero para verificar conectividad

## 🔧 Personalización

### Agregar Nuevas Pruebas

```javascript
async testMyNewFeature() {
  await this.testRunner.runTest('Mi nueva prueba', async () => {
    // Tu lógica de prueba aquí
    await this.testRunner.clickElement('selector', 'descripción');
    await this.testRunner.validateTextContent('texto esperado', 'descripción');
  });
}
```

### Modificar Configuración

Edita `config.js` para:

- Cambiar URL base
- Ajustar timeouts
- Modificar selectores
- Añadir nuevos datos de prueba

## 📞 Soporte

Si encuentras problemas:

1. Verifica que la aplicación esté corriendo
2. Revisa los selectores en caso de cambios en la UI
3. Consulta los logs detallados
4. Revisa las capturas de pantalla generadas

---

**¡Listo para automatizar tus pruebas con MCP Browser Tools! 🎉**
