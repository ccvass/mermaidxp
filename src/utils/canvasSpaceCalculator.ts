/**
 * Precise calculator for usable canvas space
 * Considers screen resolution, header, toolbar and sidebar
 */

export interface CanvasSpaceInfo {
  // Total window dimensions
  windowWidth: number;
  windowHeight: number;

  // Viewport dimensions
  viewportWidth: number;
  viewportHeight: number;

  // Fixed element heights
  headerHeight: number;
  toolbarHeight: number;

  // Sidebar width (if visible)
  sidebarWidth: number;

  // Available space for the canvas
  canvasWidth: number;
  canvasHeight: number;

  // Effective area for the diagram (with padding)
  effectiveWidth: number;
  effectiveHeight: number;

  // Screen scale factor
  devicePixelRatio: number;

  // Additional information
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Detects the dimensions of fixed UI elements
 */
function detectUIElementSizes(): {
  headerHeight: number;
  toolbarHeight: number;
  sidebarWidth: number;
} {
  // Detect header height
  const headerElement = document.querySelector('header');
  const headerHeight = headerElement ? headerElement.getBoundingClientRect().height : 60;

  // Detect toolbar height
  const toolbarElement = document.querySelector('.bg-white.dark\\:bg-gray-800.border-b');
  const toolbarHeight = toolbarElement ? toolbarElement.getBoundingClientRect().height : 50;

  // Detect sidebar width (if visible)
  const sidebarElement = document.querySelector('aside[role="complementary"]');
  const sidebarWidth = sidebarElement ? sidebarElement.getBoundingClientRect().width : 0;

  return {
    headerHeight,
    toolbarHeight,
    sidebarWidth,
  };
}

/**
 * Detects the device type based on screen size
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
 * Calculates the usable canvas space considering all UI elements
 * @param padding - Internal padding for the diagram (default: 40px)
 * @returns Complete information about available space
 */
export function calculateCanvasSpace(padding: number = 40): CanvasSpaceInfo {
  // Get window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Get viewport dimensions (considering scrollbars)
  const viewportWidth = document.documentElement.clientWidth || windowWidth;
  const viewportHeight = document.documentElement.clientHeight || windowHeight;

  // Detect UI element sizes
  const { headerHeight, toolbarHeight, sidebarWidth } = detectUIElementSizes();

  // Calculate available space for the canvas
  const canvasWidth = viewportWidth - sidebarWidth;
  const canvasHeight = viewportHeight - headerHeight - toolbarHeight;

  // Calculate effective area for the diagram (with padding)
  const effectiveWidth = Math.max(canvasWidth - padding * 2, 100);
  const effectiveHeight = Math.max(canvasHeight - padding * 2, 100);

  // Get device information
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
 * Gets the canvas container element
 * @returns Container element or null if not found
 */
export function getCanvasContainer(): HTMLElement | null {
  // Search for the canvas container using different selectors
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
 * Validates that the calculated space is reasonable
 * @param spaceInfo - Calculated space information
 * @returns true if the space is valid
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
 * Listens for window size changes and recalculates the space
 * @param callback - Function to call when size changes
 * @param debounceMs - Debounce time in milliseconds (default: 250ms)
 * @returns Cleanup function for the listener
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

  // Listen for window size changes
  window.addEventListener('resize', handleResize);

  // Listen for orientation changes on mobile
  window.addEventListener('orientationchange', handleResize);

  // Cleanup function
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
}

/**
 * Gets debug information about the canvas space
 * @returns Detailed information for debugging
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
