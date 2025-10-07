import { SVGShapeGenerators, SVGGeneratorParams } from '../svgShapeGenerators';

describe('SVGShapeGenerators', () => {
  const defaultParams: SVGGeneratorParams = {
    id: 'test-shape',
    x: 10,
    y: 20,
    width: 100,
    height: 60,
    text: 'Test Shape',
    fill: '#e3f2fd',
    stroke: '#1976d2',
    strokeWidth: 2,
  };

  describe('Basic Shapes', () => {
    test('rectangle generator produces valid SVG', () => {
      const svg = SVGShapeGenerators.rectangle(defaultParams);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('transform="translate(10, 20)"');
      expect(svg).toContain('<rect');
      expect(svg).toContain('width="100"');
      expect(svg).toContain('height="60"');
      expect(svg).toContain('fill="#e3f2fd"');
      expect(svg).toContain('stroke="#1976d2"');
      expect(svg).toContain('stroke-width="2"');
      expect(svg).toContain('Test Shape');
    });

    test('circle generator produces valid SVG', () => {
      const svg = SVGShapeGenerators.circle(defaultParams);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<circle');
      expect(svg).toContain('cx="50"'); // width/2
      expect(svg).toContain('cy="30"'); // height/2
      expect(svg).toContain('r="28"'); // min(width,height)/2 - strokeWidth
      expect(svg).toContain('Test Shape');
    });

    test('diamond generator produces valid SVG', () => {
      const svg = SVGShapeGenerators.diamond(defaultParams);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<polygon');
      expect(svg).toContain('points=');
      expect(svg).toContain('Test Shape');
    });

    test('hexagon generator produces valid SVG', () => {
      const svg = SVGShapeGenerators.hexagon(defaultParams);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<polygon');
      expect(svg).toContain('points=');
      expect(svg).toContain('Test Shape');

      // Should have 6 points (hexagon)
      const pointsMatch = svg.match(/points="([^"]+)"/);
      if (pointsMatch) {
        const points = pointsMatch[1].split(' ');
        expect(points.length).toBe(6);
      }
    });

    test('ellipse generator produces valid SVG', () => {
      const svg = SVGShapeGenerators.ellipse(defaultParams);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<ellipse');
      expect(svg).toContain('cx="50"');
      expect(svg).toContain('cy="30"');
      expect(svg).toContain('rx=');
      expect(svg).toContain('ry=');
      expect(svg).toContain('Test Shape');
    });

    test('triangle generator produces valid SVG', () => {
      const svg = SVGShapeGenerators.triangle(defaultParams);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<polygon');
      expect(svg).toContain('points=');
      expect(svg).toContain('Test Shape');

      // Should have 3 points (triangle)
      const pointsMatch = svg.match(/points="([^"]+)"/);
      if (pointsMatch) {
        const points = pointsMatch[1].split(' ');
        expect(points.length).toBe(3);
      }
    });

    test('star generator produces valid SVG', () => {
      const svg = SVGShapeGenerators.star(defaultParams);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<polygon');
      expect(svg).toContain('points=');
      expect(svg).toContain('Test Shape');

      // Should have 10 points (5-pointed star)
      const pointsMatch = svg.match(/points="([^"]+)"/);
      if (pointsMatch) {
        const points = pointsMatch[1].split(' ');
        expect(points.length).toBe(10);
      }
    });
  });

  describe('Flowchart Shapes', () => {
    test('process generator produces valid SVG', () => {
      const params = { ...defaultParams, text: 'Process' };
      const svg = SVGShapeGenerators.process(params);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<rect');
      expect(svg).toContain('rx="8"'); // Rounded corners
      expect(svg).toContain('Process');
    });

    test('decision generator produces valid SVG', () => {
      const params = { ...defaultParams, text: '?' };
      const svg = SVGShapeGenerators.decision(params);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<polygon');
      expect(svg).toContain('?');
    });

    test('startEnd generator produces valid SVG', () => {
      const params = { ...defaultParams, text: 'Start' };
      const svg = SVGShapeGenerators.startEnd(params);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<rect');
      expect(svg).toContain('rx="30"'); // Rounded ends
      expect(svg).toContain('Start');
    });

    test('database generator produces valid SVG', () => {
      const params = { ...defaultParams, text: 'DB' };
      const svg = SVGShapeGenerators.database(params);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<ellipse'); // Top and bottom ellipses
      expect(svg).toContain('<rect'); // Body
      expect(svg).toContain('<line'); // Side lines
      expect(svg).toContain('DB');
    });
  });

  describe('Architecture Shapes', () => {
    test('server generator produces valid SVG', () => {
      const params = { ...defaultParams, text: 'Server' };
      const svg = SVGShapeGenerators.server(params);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<rect');
      expect(svg).toContain('<line'); // Server rack lines
      expect(svg).toContain('Server');
    });

    test('cloud generator produces valid SVG', () => {
      const params = { ...defaultParams, text: 'Cloud' };
      const svg = SVGShapeGenerators.cloud(params);

      expect(svg).toContain('<g id="test-shape"');
      expect(svg).toContain('<circle'); // Multiple circles for cloud shape
      expect(svg).toContain('Cloud');

      // Should have multiple circles
      const circleMatches = svg.match(/<circle/g);
      expect(circleMatches?.length).toBeGreaterThan(3);
    });
  });

  describe('Parameter Handling', () => {
    test('handles missing optional parameters', () => {
      const minimalParams = {
        id: 'minimal',
        x: 0,
        y: 0,
        width: 50,
        height: 30,
      };

      expect(() => {
        SVGShapeGenerators.rectangle(minimalParams);
      }).not.toThrow();

      const svg = SVGShapeGenerators.rectangle(minimalParams);
      expect(svg).toContain('id="minimal"');
      expect(svg).toContain('width="50"');
      expect(svg).toContain('height="30"');
    });

    test('uses default values for missing parameters', () => {
      const params = {
        id: 'defaults',
        x: 0,
        y: 0,
        width: 100,
        height: 60,
      };

      const svg = SVGShapeGenerators.rectangle(params);

      // Should use default fill and stroke
      expect(svg).toContain('fill="#e3f2fd"');
      expect(svg).toContain('stroke="#1976d2"');
      expect(svg).toContain('stroke-width="2"');
    });

    test('handles edge case dimensions', () => {
      const smallParams = { ...defaultParams, width: 1, height: 1 };
      const largeParams = { ...defaultParams, width: 1000, height: 1000 };

      expect(() => {
        SVGShapeGenerators.rectangle(smallParams);
        SVGShapeGenerators.circle(smallParams);
        SVGShapeGenerators.rectangle(largeParams);
        SVGShapeGenerators.circle(largeParams);
      }).not.toThrow();
    });

    test('handles special characters in text', () => {
      const specialParams = {
        ...defaultParams,
        text: '<>&"\'Special',
      };

      const svg = SVGShapeGenerators.rectangle(specialParams);
      expect(svg).toContain('<>&"\'Special');
    });
  });

  describe('SVG Structure Validation', () => {
    test('all generators produce well-formed XML', () => {
      const generators = Object.values(SVGShapeGenerators);

      generators.forEach((generator) => {
        const svg = generator(defaultParams);

        // Should be parseable as XML
        expect(() => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`, 'image/svg+xml');
          const errors = doc.querySelectorAll('parsererror');
          expect(errors.length).toBe(0);
        }).not.toThrow();
      });
    });

    test('all generators include required attributes', () => {
      const generators = Object.values(SVGShapeGenerators);

      generators.forEach((generator) => {
        const svg = generator(defaultParams);

        // Should have group with ID
        expect(svg).toContain('<g id="test-shape"');
        expect(svg).toContain('transform="translate(10, 20)"');
        expect(svg).toContain('</g>');
      });
    });

    test('text positioning is consistent', () => {
      const generators = Object.values(SVGShapeGenerators);

      generators.forEach((generator) => {
        const svg = generator(defaultParams);

        if (svg.includes('<text')) {
          // Text should have proper positioning attributes
          expect(svg).toMatch(/text-anchor="middle"/);
          expect(svg).toMatch(/dominant-baseline="middle"/);
        }
      });
    });
  });

  describe('Performance', () => {
    test('generators execute quickly', () => {
      const generators = Object.values(SVGShapeGenerators);

      generators.forEach((generator) => {
        const startTime = performance.now();

        // Generate 100 shapes
        for (let i = 0; i < 100; i++) {
          generator({ ...defaultParams, id: `perf-test-${i}` });
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Should generate 100 shapes in less than 10ms
        expect(duration).toBeLessThan(10);
      });
    });

    test('generated SVG size is reasonable', () => {
      const generators = Object.values(SVGShapeGenerators);

      generators.forEach((generator) => {
        const svg = generator(defaultParams);

        // SVG should not be excessively large
        expect(svg.length).toBeLessThan(2000);
        expect(svg.length).toBeGreaterThan(50);
      });
    });
  });
});
