/**
 * Unit tests for geometry utilities
 *
 * This test file verifies that the Point interface and related
 * geometry functions work correctly and can be imported properly.
 */

import {
  Point,
  distance,
  angle,
  lerp,
  add,
  subtract,
  scale,
  rotatePoint,
  clampPoint,
  arePointsEqual,
  fromPolar,
  toPolar,
} from '../geometry';

describe('Geometry Utilities', () => {
  describe('Point interface', () => {
    it('should allow creating Point objects', () => {
      const point: Point = { x: 10, y: 20 };

      expect(point.x).toBe(10);
      expect(point.y).toBe(20);
    });

    it('should work with negative coordinates', () => {
      const point: Point = { x: -5, y: -10 };

      expect(point.x).toBe(-5);
      expect(point.y).toBe(-10);
    });

    it('should work with decimal coordinates', () => {
      const point: Point = { x: 3.14, y: 2.71 };

      expect(point.x).toBeCloseTo(3.14, 2);
      expect(point.y).toBeCloseTo(2.71, 2);
    });
  });

  describe('distance function', () => {
    it('should calculate distance between two points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 3, y: 4 };

      expect(distance(p1, p2)).toBe(5);
    });

    it('should handle same points', () => {
      const p1: Point = { x: 5, y: 10 };
      const p2: Point = { x: 5, y: 10 };

      expect(distance(p1, p2)).toBe(0);
    });
  });

  describe('angle function', () => {
    it('should calculate angle between two points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 1, y: 0 };

      expect(angle(p1, p2)).toBe(0);
    });

    it('should handle vertical line', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 0, y: 1 };

      expect(angle(p1, p2)).toBeCloseTo(Math.PI / 2, 6);
    });
  });

  describe('lerp function', () => {
    it('should interpolate between two points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 10, y: 20 };

      const result = lerp(p1, p2, 0.5);
      expect(result).toEqual({ x: 5, y: 10 });
    });

    it('should return first point at t=0', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 10, y: 20 };

      const result = lerp(p1, p2, 0);
      expect(result).toEqual(p1);
    });

    it('should return second point at t=1', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 10, y: 20 };

      const result = lerp(p1, p2, 1);
      expect(result).toEqual(p2);
    });
  });

  describe('add function', () => {
    it('should add two points', () => {
      const p1: Point = { x: 1, y: 2 };
      const p2: Point = { x: 3, y: 4 };

      const result = add(p1, p2);
      expect(result).toEqual({ x: 4, y: 6 });
    });
  });

  describe('subtract function', () => {
    it('should subtract two points', () => {
      const p1: Point = { x: 5, y: 8 };
      const p2: Point = { x: 2, y: 3 };

      const result = subtract(p1, p2);
      expect(result).toEqual({ x: 3, y: 5 });
    });
  });

  describe('scale function', () => {
    it('should scale a point', () => {
      const point: Point = { x: 3, y: 4 };

      const result = scale(point, 2);
      expect(result).toEqual({ x: 6, y: 8 });
    });

    it('should handle negative scaling', () => {
      const point: Point = { x: 3, y: 4 };

      const result = scale(point, -1);
      expect(result).toEqual({ x: -3, y: -4 });
    });
  });

  describe('rotatePoint function', () => {
    it('should rotate point around origin', () => {
      const point: Point = { x: 1, y: 0 };
      const origin: Point = { x: 0, y: 0 };

      const result = rotatePoint(point, origin, Math.PI / 2);
      expect(result.x).toBeCloseTo(0, 6);
      expect(result.y).toBeCloseTo(1, 6);
    });
  });

  describe('clampPoint function', () => {
    it('should clamp point within bounds', () => {
      const point: Point = { x: 15, y: 25 };
      const bounds = new DOMRect(0, 0, 10, 20);

      const result = clampPoint(point, bounds);
      expect(result).toEqual({ x: 10, y: 20 });
    });

    it('should not modify point already within bounds', () => {
      const point: Point = { x: 5, y: 10 };
      const bounds = new DOMRect(0, 0, 10, 20);

      const result = clampPoint(point, bounds);
      expect(result).toEqual(point);
    });
  });

  describe('arePointsEqual function', () => {
    it('should return true for equal points', () => {
      const p1: Point = { x: 1, y: 2 };
      const p2: Point = { x: 1, y: 2 };

      expect(arePointsEqual(p1, p2)).toBe(true);
    });

    it('should return false for different points', () => {
      const p1: Point = { x: 1, y: 2 };
      const p2: Point = { x: 3, y: 4 };

      expect(arePointsEqual(p1, p2)).toBe(false);
    });

    it('should handle tolerance', () => {
      const p1: Point = { x: 1.0000001, y: 2 };
      const p2: Point = { x: 1, y: 2 };

      expect(arePointsEqual(p1, p2)).toBe(true);
      expect(arePointsEqual(p1, p2, 1e-10)).toBe(false);
    });
  });

  describe('polar coordinate functions', () => {
    it('should convert from polar coordinates', () => {
      const result = fromPolar(5, 0);

      expect(result.x).toBeCloseTo(5, 6);
      expect(result.y).toBeCloseTo(0, 6);
    });

    it('should convert to polar coordinates', () => {
      const point: Point = { x: 3, y: 4 };
      const polar = toPolar(point);

      expect(polar.radius).toBe(5);
      expect(polar.angle).toBeCloseTo(Math.atan2(4, 3), 6);
    });

    it('should handle round trip conversion', () => {
      const original: Point = { x: 3, y: 4 };
      const polar = toPolar(original);
      const restored = fromPolar(polar.radius, polar.angle);

      expect(restored.x).toBeCloseTo(original.x, 6);
      expect(restored.y).toBeCloseTo(original.y, 6);
    });
  });
});
