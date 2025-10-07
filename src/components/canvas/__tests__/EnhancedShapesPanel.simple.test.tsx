/**
 * Simple test to verify the EnhancedShapesPanel error is fixed
 */

import { SHAPE_LIBRARIES } from '../../../constants/shapes.constants';

describe('EnhancedShapesPanel Error Fix', () => {
  test('all shapes have svgGenerator instead of syntax', () => {
    SHAPE_LIBRARIES.forEach((library) => {
      library.shapes.forEach((shape) => {
        // Should have svgGenerator
        expect(shape).toHaveProperty('svgGenerator');
        expect(typeof shape.svgGenerator).toBe('function');

        // Should NOT have syntax (the old property that caused the error)
        expect(shape).not.toHaveProperty('syntax');
      });
    });
  });

  test('svgGenerator functions work correctly', () => {
    SHAPE_LIBRARIES.forEach((library) => {
      library.shapes.forEach((shape) => {
        const testParams = {
          id: 'test',
          x: 0,
          y: 0,
          width: 100,
          height: 60,
          text: 'Test',
          fill: '#test',
          stroke: '#test',
        };

        // Should not throw when called
        expect(() => {
          const result = shape.svgGenerator(testParams);
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
      });
    });
  });

  test('shape preview will use svgGenerator not syntax', () => {
    // Get first shape for testing
    const firstShape = SHAPE_LIBRARIES[0].shapes[0];

    // Simulate what the preview does
    const previewSVG = firstShape.svgGenerator({
      id: 'preview',
      x: 5,
      y: 5,
      width: 50,
      height: 30,
      text: firstShape.name,
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 1,
    });

    expect(typeof previewSVG).toBe('string');
    expect(previewSVG).toContain('<');
    expect(previewSVG).toContain('>');

    // Should not be able to call .syntax (the old way that caused the error)
    expect((firstShape as any).syntax).toBeUndefined();
  });
});
