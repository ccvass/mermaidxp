import { describe, it, expect } from 'vitest';
import { extractNodeId, clearNodeIdCache, isDraggableElement } from './nodeIdExtractor';

function createSVGElement(tag: string, attrs: Record<string, string> = {}): SVGElement {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag) as SVGElement;
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') {
      v.split(' ').filter(Boolean).forEach((c) => el.classList.add(c));
    } else {
      el.setAttribute(k, v);
    }
  });
  return el;
}

describe('extractNodeId', () => {
  describe('ID patterns', () => {
    it('should extract node ID from class matching in id (flowchart-MyNode-1)', () => {
      const el = createSVGElement('g', { id: 'flowchart-MyNode-1', class: 'node default MyNode' });
      expect(extractNodeId(el)).toBe('MyNode');
    });

    it('should extract from diagramType-nodeId pattern', () => {
      const el = createSVGElement('g', { id: 'graph-ServerA', class: 'node default' });
      expect(extractNodeId(el)).toBe('ServerA');
    });

    it('should extract from diagramType-nodeId-number pattern', () => {
      const el = createSVGElement('g', { id: 'flowchart-Login-5', class: 'node default' });
      expect(extractNodeId(el)).toBe('Login');
    });

    it('should extract from class list when single non-structural class', () => {
      const el = createSVGElement('g', { id: 'someId', class: 'node MyCustomNode' });
      expect(extractNodeId(el)).toBe('MyCustomNode');
    });

    it('should use ID as fallback when not a structural keyword', () => {
      const el = createSVGElement('g', { id: 'UniqueNode', class: 'UniqueNode' });
      expect(extractNodeId(el)).toBe('UniqueNode');
    });
  });

  describe('elements without IDs', () => {
    it('should return null for elements without id', () => {
      const el = createSVGElement('g', { class: 'node default' });
      expect(extractNodeId(el)).toBeNull();
    });
  });

  describe('structural keywords', () => {
    it('should return null when id is a structural keyword and no valid class', () => {
      const el = createSVGElement('g', { id: 'node', class: 'node default' });
      expect(extractNodeId(el)).toBeNull();
    });
  });

  describe('caching', () => {
    it('should return cached result on second call', () => {
      const el = createSVGElement('g', { id: 'flowchart-X-1', class: 'node X' });
      const first = extractNodeId(el);
      const second = extractNodeId(el);
      expect(first).toBe(second);
      expect(first).toBe('X');
    });
  });
});

describe('clearNodeIdCache', () => {
  it('should not throw', () => {
    expect(() => clearNodeIdCache()).not.toThrow();
  });
});

describe('isDraggableElement', () => {
  it('should return null for non-SVG targets', () => {
    const div = document.createElement('div');
    expect(isDraggableElement(div)).toBeNull();
  });

  it('should return null for null target', () => {
    expect(isDraggableElement(null)).toBeNull();
  });

  it('should find draggable ancestor', () => {
    const parent = createSVGElement('g', { class: 'draggable-element' });
    const child = createSVGElement('rect');
    parent.appendChild(child);
    // Need to attach to document for parentElement to work in jsdom
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.appendChild(parent);
    document.body.appendChild(svg);

    const result = isDraggableElement(child);
    expect(result).toBe(parent);

    document.body.removeChild(svg);
  });

  it('should return null when no draggable ancestor within 10 levels', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const leaf = createSVGElement('rect');
    svg.appendChild(leaf);
    document.body.appendChild(svg);

    expect(isDraggableElement(leaf)).toBeNull();

    document.body.removeChild(svg);
  });
});
