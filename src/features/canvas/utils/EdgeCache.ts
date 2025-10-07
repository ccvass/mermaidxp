import { EdgeInfo } from '../../../types/diagram.types';

/**
 * LRU Cache implementation for edge information
 * Helps optimize drag & drop performance by caching edge data
 */
export class EdgeCache {
  private cache: Map<string, EdgeInfo>;
  private accessOrder: string[];
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.accessOrder = [];
    this.maxSize = maxSize;
  }

  /**
   * Set or update an edge in the cache
   */
  set(key: string, value: EdgeInfo): void {
    // Remove from access order if it exists
    const existingIndex = this.accessOrder.indexOf(key);
    if (existingIndex !== -1) {
      this.accessOrder.splice(existingIndex, 1);
    }

    // Add to end (most recently used)
    this.accessOrder.push(key);
    this.cache.set(key, value);

    // Evict least recently used if over capacity
    if (this.cache.size > this.maxSize) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }
  }

  /**
   * Get an edge from the cache
   */
  get(key: string): EdgeInfo | undefined {
    const value = this.cache.get(key);

    if (value) {
      // Move to end (most recently used)
      const index = this.accessOrder.indexOf(key);
      if (index !== -1) {
        this.accessOrder.splice(index, 1);
        this.accessOrder.push(key);
      }
    }

    return value;
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a specific edge from the cache
   */
  delete(key: string): boolean {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    return this.cache.delete(key);
  }

  /**
   * Clear all edges from the cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get the current size of the cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get all edges that connect to a specific node
   */
  getEdgesForNode(nodeId: string): EdgeInfo[] {
    const edges: EdgeInfo[] = [];

    this.cache.forEach((edge) => {
      if (edge.connectedNodeIds.includes(nodeId)) {
        edges.push(edge);
      }
    });

    return edges;
  }

  /**
   * Update all edges that connect to a specific node
   */
  updateEdgesForNode(nodeId: string, updateFn: (edge: EdgeInfo) => EdgeInfo): void {
    this.cache.forEach((edge, key) => {
      if (edge.connectedNodeIds.includes(nodeId)) {
        const updatedEdge = updateFn(edge);
        this.set(key, updatedEdge);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    evictionCount: number;
  } {
    // In a real implementation, we would track hits/misses
    // For now, return basic stats
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track this
      evictionCount: 0, // Would need to track this
    };
  }

  /**
   * Serialize cache to JSON (useful for debugging)
   */
  toJSON(): Record<string, EdgeInfo> {
    const obj: Record<string, EdgeInfo> = {};
    this.cache.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  /**
   * Create a cache from serialized data
   */
  static fromJSON(data: Record<string, EdgeInfo>, maxSize = 1000): EdgeCache {
    const cache = new EdgeCache(maxSize);
    Object.entries(data).forEach(([key, value]) => {
      cache.set(key, value);
    });
    return cache;
  }
}

// Singleton instance for the application
let edgeCacheInstance: EdgeCache | null = null;

/**
 * Get the singleton edge cache instance
 */
export function getEdgeCache(): EdgeCache {
  if (!edgeCacheInstance) {
    edgeCacheInstance = new EdgeCache();
  }
  return edgeCacheInstance;
}

/**
 * Reset the edge cache (useful for testing or when diagram changes significantly)
 */
export function resetEdgeCache(): void {
  if (edgeCacheInstance) {
    edgeCacheInstance.clear();
  }
  edgeCacheInstance = null;
}
