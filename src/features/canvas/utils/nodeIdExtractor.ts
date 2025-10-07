import { DRAGGABLE_ELEMENT_CLASSES } from '../../../constants/diagram.constants';

// Cache for node IDs to improve performance
const NODE_ID_CACHE = new WeakMap<SVGElement, string | null>();

// Keywords that are structural or style-related, not actual node IDs
const STRUCTURAL_KEYWORDS = new Set([
  'node',
  'default',
  'cluster',
  'root',
  'subgraph',
  'point',
  'label',
  'edge',
  'path',
  'statediagram-state',
  'type-normal',
  'type-start',
  'type-end',
  'type-divider',
  'type-group',
  'type-fork',
  'type-join',
  'clickable',
  'custom',
  'messageLine0',
  'messageLine1',
  'messageText',
  'highlight',
  'children',
  'leaf',
  'parent',
  'title',
  'divider',
  'loop',
  'alt',
  'opt',
  'rect',
  'text',
  'circle',
  'ellipse',
  'polygon',
  'foreignobject',
  'active',
  'done',
  'crit',
  'mermaid',
  'labs',
  'output',
  'error-indicator',
  'error-text',
  'version',
  ...DRAGGABLE_ELEMENT_CLASSES,
]);

const COMMON_DIAGRAM_PREFIXES = [
  'flowchart',
  'graph',
  'statediagram',
  'classdiagram',
  'sequencediagram',
  'gantt',
  'er',
  'gitgraph',
  'pie',
  'journey',
  'requirement',
  'c4',
  'actor',
  'state',
  'note',
  'task',
  'section',
];

/**
 * Extract the Mermaid node ID from an SVG element
 * Uses caching for performance optimization
 */
export function extractNodeId(element: SVGElement): string | null {
  // Check cache first
  if (NODE_ID_CACHE.has(element)) {
    return NODE_ID_CACHE.get(element)!;
  }

  const nodeId = extractNodeIdInternal(element);
  NODE_ID_CACHE.set(element, nodeId);

  return nodeId;
}

/**
 * Internal function to extract node ID without caching
 */
function extractNodeIdInternal(svgNodeGroup: SVGElement): string | null {
  const svgId = svgNodeGroup.id;
  if (!svgId) return null;

  // Try to find ID from classes first
  for (const cls of Array.from(svgNodeGroup.classList)) {
    if (!STRUCTURAL_KEYWORDS.has(cls.toLowerCase()) && svgId.includes(cls)) {
      // Skip pure numeric classes unless they're part of the ID structure
      if (/^\d+$/.test(cls) && !svgId.match(new RegExp(`(?:^|[-_:])${cls}(?:[-_:]|$)`))) {
        continue;
      }
      return cls;
    }
  }

  // Parse ID parts
  const idParts = svgId.split(/[-_:]/);

  // Handle common diagram patterns
  if (idParts.length > 1) {
    // Pattern: diagramType-nodeId-number
    if (
      idParts.length > 2 &&
      COMMON_DIAGRAM_PREFIXES.includes(idParts[0].toLowerCase()) &&
      /^\d+$/.test(idParts[idParts.length - 1])
    ) {
      const potentialId = idParts.slice(1, -1).join('-');
      if (potentialId && !STRUCTURAL_KEYWORDS.has(potentialId.toLowerCase())) {
        return potentialId;
      }
    }

    // Pattern: diagramType-nodeId
    if (idParts.length === 2 && COMMON_DIAGRAM_PREFIXES.includes(idParts[0].toLowerCase())) {
      const potentialId = idParts[1];
      if (potentialId && !STRUCTURAL_KEYWORDS.has(potentialId.toLowerCase())) {
        return potentialId;
      }
    }

    // Pattern: nodeId-number
    if (idParts.length > 1 && /^\d+$/.test(idParts[idParts.length - 1])) {
      const potentialId = idParts.slice(0, -1).join('-');
      if (
        potentialId &&
        !STRUCTURAL_KEYWORDS.has(potentialId.toLowerCase()) &&
        svgNodeGroup.classList.contains(potentialId)
      ) {
        return potentialId;
      }
    }
  }

  // Check if ID itself is a valid node ID
  if (svgNodeGroup.classList.contains(svgId) && !STRUCTURAL_KEYWORDS.has(svgId.toLowerCase())) {
    return svgId;
  }

  // Try to find from class list
  const potentialClassIds = Array.from(svgNodeGroup.classList).filter(
    (cls) =>
      !STRUCTURAL_KEYWORDS.has(cls.toLowerCase()) && !cls.startsWith('LS-') && !cls.startsWith('LE-') && cls.length > 0
  );

  if (potentialClassIds.length === 1 && !/^\d+$/.test(potentialClassIds[0])) {
    return potentialClassIds[0];
  }

  if (potentialClassIds.length > 0) {
    const nonNumeric = potentialClassIds.find((cls) => !/^\d+$/.test(cls));
    if (nonNumeric) return nonNumeric;
  }

  // Last resort: use ID if it's not a keyword
  if (!STRUCTURAL_KEYWORDS.has(svgId.toLowerCase())) {
    return svgId;
  }

  return null;
}

/**
 * Clear the node ID cache (useful when diagram changes)
 */
export function clearNodeIdCache(): void {
  // WeakMap automatically garbage collects, but we can help by removing references
  // In practice, this is a no-op for WeakMap, but kept for API consistency
}

/**
 * Check if an element is draggable based on its structure
 */
export function isDraggableElement(target: EventTarget | null): SVGGraphicsElement | null {
  if (!(target instanceof SVGElement)) {
    return null;
  }

  let current: SVGElement | null = target;
  let level = 0;
  const maxLevels = 10;

  while (current && level < maxLevels) {
    if (current.classList.contains('draggable-element')) {
      // Ensure all children have proper pointer events
      current.querySelectorAll('*').forEach((child) => {
        if (child instanceof SVGElement) {
          child.style.pointerEvents = 'all';
          child.style.cursor = 'grab';
        }
      });
      return current as SVGGraphicsElement;
    }

    current = current.parentElement instanceof SVGElement ? current.parentElement : null;
    level++;
  }

  return null;
}
