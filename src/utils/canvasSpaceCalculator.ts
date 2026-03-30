/**
 * Calculadora precisa del espacio usable del canvas
 * Considera la resolución de pantalla, header, toolbar y sidebar
 */

export interface CanvasSpaceInfo {
  // Dimensiones totales de la ventana
  windowWidth: number;
  windowHeight: number;

  // Dimensiones del viewport
  viewportWidth: number;
  viewportHeight: number;

  // Alturas de elementos fijos
  headerHeight: number;
  toolbarHeight: number;

  // Ancho del sidebar (si está visible)
  sidebarWidth: number;

  // Espacio disponible para el canvas
  canvasWidth: number;
  canvasHeight: number;

  // Área efectiva para el diagrama (con padding)
  effectiveWidth: number;
  effectiveHeight: number;

  // Factor de escala de la pantalla
  devicePixelRatio: number;

  // Información adicional
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Detecta las dimensiones de elementos fijos de la UI
 */
function detectUIElementSizes(): {
  headerHeight: number;
  toolbarHeight: number;
  sidebarWidth: number;
} {
  // Detectar altura del header
  const headerElement = document.querySelector('header');
  const headerHeight = headerElement ? headerElement.getBoundingClientRect().height : 60;

  // Detectar altura del toolbar
  const toolbarElement = document.querySelector('.bg-white.dark\\:bg-gray-800.border-b');
  const toolbarHeight = toolbarElement ? toolbarElement.getBoundingClientRect().height : 50;

  // Detectar ancho del sidebar (si está visible)
  const sidebarElement = document.querySelector('aside[role="complementary"]');
  const sidebarWidth = sidebarElement ? sidebarElement.getBoundingClientRect().width : 0;

  return {
    headerHeight,
    toolbarHeight,
    sidebarWidth,
  };
}

/**
 * Detecta el tipo de dispositivo basado en el tamaño de pantalla
 */
function detectDeviceType(width: number): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} {
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return { isMobile, isTablet, isDesktop };
}

/**
 * Calcula el espacio usable del canvas considerando todos los elementos de la UI
 * @param padding - Padding interno para el diagrama (default: 40px)
 * @returns Información completa del espacio disponible
 */
export function calculateCanvasSpace(padding: number = 40): CanvasSpaceInfo {
  // Obtener dimensiones de la ventana
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Obtener dimensiones del viewport (considerando scrollbars)
  const viewportWidth = document.documentElement.clientWidth || windowWidth;
  const viewportHeight = document.documentElement.clientHeight || windowHeight;

  // Detectar tamaños de elementos UI
  const { headerHeight, toolbarHeight, sidebarWidth } = detectUIElementSizes();

  // Calcular espacio disponible para el canvas
  const canvasWidth = viewportWidth - sidebarWidth;
  const canvasHeight = viewportHeight - headerHeight - toolbarHeight;

  // Calcular área efectiva para el diagrama (con padding)
  const effectiveWidth = Math.max(canvasWidth - padding * 2, 100);
  const effectiveHeight = Math.max(canvasHeight - padding * 2, 100);

  // Obtener información del dispositivo
  const devicePixelRatio = window.devicePixelRatio || 1;
  const deviceInfo = detectDeviceType(windowWidth);

  const spaceInfo: CanvasSpaceInfo = {
    windowWidth,
    windowHeight,
    viewportWidth,
    viewportHeight,
    headerHeight,
    toolbarHeight,
    sidebarWidth,
    canvasWidth,
    canvasHeight,
    effectiveWidth,
    effectiveHeight,
    devicePixelRatio,
    ...deviceInfo,
  };

  return spaceInfo;
}

/**
 * Obtiene el elemento contenedor del canvas
 * @returns Elemento contenedor o null si no se encuentra
 */
export function getCanvasContainer(): HTMLElement | null {
  // Buscar el contenedor del canvas por diferentes selectores
  const selectors = [
    '[data-interaction-mode]',
    '.diagram-container',
    'section[role="main"]',
    '.flex-1.h-full.relative',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      return element;
    }
  }

  return null;
}

/**
 * Valida que el espacio calculado sea razonable
 * @param spaceInfo - Información del espacio calculado
 * @returns true si el espacio es válido
 */
export function validateCanvasSpace(spaceInfo: CanvasSpaceInfo): boolean {
  const minWidth = 200;
  const minHeight = 150;

  const isValid =
    spaceInfo.effectiveWidth >= minWidth &&
    spaceInfo.effectiveHeight >= minHeight &&
    spaceInfo.canvasWidth > 0 &&
    spaceInfo.canvasHeight > 0;

  if (!isValid) {
    // Canvas space insufficient
  }

  return isValid;
}

/**
 * Escucha cambios en el tamaño de la ventana y recalcula el espacio
 * @param callback - Función a llamar cuando cambie el tamaño
 * @param debounceMs - Tiempo de debounce en milisegundos (default: 250ms)
 * @returns Función para limpiar el listener
 */
export function watchCanvasSpaceChanges(
  callback: (spaceInfo: CanvasSpaceInfo) => void,
  debounceMs: number = 250
): () => void {
  let timeoutId: NodeJS.Timeout;

  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const spaceInfo = calculateCanvasSpace();
      if (validateCanvasSpace(spaceInfo)) {
        callback(spaceInfo);
      }
    }, debounceMs);
  };

  // Escuchar cambios de tamaño de ventana
  window.addEventListener('resize', handleResize);

  // Escuchar cambios de orientación en móviles
  window.addEventListener('orientationchange', handleResize);

  // Cleanup function
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
}

/**
 * Obtiene información de debug del espacio del canvas
 * @returns Información detallada para debugging
 */
export function getCanvasSpaceDebugInfo(): Record<string, any> {
  const spaceInfo = calculateCanvasSpace();
  const container = getCanvasContainer();
  const containerRect = container?.getBoundingClientRect();

  return {
    calculated: spaceInfo,
    actualContainer: containerRect
      ? {
          width: containerRect.width,
          height: containerRect.height,
          top: containerRect.top,
          left: containerRect.left,
        }
      : null,
    elements: {
      header: document.querySelector('header')?.getBoundingClientRect(),
      toolbar: document.querySelector('.bg-white.dark\\:bg-gray-800.border-b')?.getBoundingClientRect(),
      sidebar: document.querySelector('aside[role="complementary"]')?.getBoundingClientRect(),
    },
    viewport: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
    },
  };
}
