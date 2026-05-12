import { describe, it, expect, beforeEach } from 'vitest';
import { EdgeCache, getEdgeCache, resetEdgeCache } from './EdgeCache';
import { EdgeInfo } from '../../../types/diagram.types';

function makeEdge(connectedNodeIds: string[]): EdgeInfo {
  return {
    pathEl: document.createElementNS('http://www.w3.org/2000/svg', 'path') as SVGPathElement,
    originalD: 'M0,0 L10,10',
    connectedNodeIds,
  };
}

describe('EdgeCache', () => {
  let cache: EdgeCache;

  beforeEach(() => {
    cache = new EdgeCache(3);
  });

  describe('set/get', () => {
    it('should store and retrieve values', () => {
      const edge = makeEdge(['A', 'B']);
      cache.set('e1', edge);
      expect(cache.get('e1')).toBe(edge);
    });

    it('should return undefined for missing keys', () => {
      expect(cache.get('missing')).toBeUndefined();
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used when maxSize exceeded', () => {
      cache.set('e1', makeEdge(['A']));
      cache.set('e2', makeEdge(['B']));
      cache.set('e3', makeEdge(['C']));
      cache.set('e4', makeEdge(['D'])); // should evict e1

      expect(cache.has('e1')).toBe(false);
      expect(cache.has('e4')).toBe(true);
    });

    it('should promote accessed items', () => {
      cache.set('e1', makeEdge(['A']));
      cache.set('e2', makeEdge(['B']));
      cache.set('e3', makeEdge(['C']));
      cache.get('e1'); // promote e1
      cache.set('e4', makeEdge(['D'])); // should evict e2

      expect(cache.has('e1')).toBe(true);
      expect(cache.has('e2')).toBe(false);
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      cache.set('e1', makeEdge(['A']));
      expect(cache.has('e1')).toBe(true);
    });

    it('should return false for missing keys', () => {
      expect(cache.has('nope')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove entries', () => {
      cache.set('e1', makeEdge(['A']));
      expect(cache.delete('e1')).toBe(true);
      expect(cache.has('e1')).toBe(false);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.delete('nope')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should empty the cache', () => {
      cache.set('e1', makeEdge(['A']));
      cache.set('e2', makeEdge(['B']));
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has('e1')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return correct size and maxSize', () => {
      cache.set('e1', makeEdge(['A']));
      const stats = cache.getStats();
      expect(stats.size).toBe(1);
      expect(stats.maxSize).toBe(3);
    });
  });

  describe('getEdgesForNode', () => {
    it('should return edges connected to a node', () => {
      cache.set('e1', makeEdge(['A', 'B']));
      cache.set('e2', makeEdge(['B', 'C']));
      cache.set('e3', makeEdge(['C', 'D']));

      const edges = cache.getEdgesForNode('B');
      expect(edges).toHaveLength(2);
    });
  });

  describe('singleton', () => {
    it('should return same instance from getEdgeCache', () => {
      resetEdgeCache();
      const a = getEdgeCache();
      const b = getEdgeCache();
      expect(a).toBe(b);
    });

    it('should reset instance on resetEdgeCache', () => {
      resetEdgeCache();
      const a = getEdgeCache();
      a.set('x', makeEdge(['A']));
      resetEdgeCache();
      const b = getEdgeCache();
      expect(b.size).toBe(0);
    });
  });
});
