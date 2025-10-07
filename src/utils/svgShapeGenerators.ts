// SVG Shape Generators for Canvas Placement
export interface SVGGeneratorParams {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

// Basic Shape Generators
export const SVGShapeGenerators = {
  // BASIC SHAPES
  rectangle: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = '', fill = '#e3f2fd', stroke = '#1976d2', strokeWidth = 2 } = params;
    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <rect 
          width="${width}" 
          height="${height}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
          rx="4"
        />
        ${text ? `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#333">${text}</text>` : ''}
      </g>
    `;
  },

  circle: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = '', fill = '#e8f5e8', stroke = '#4caf50', strokeWidth = 2 } = params;
    const radius = Math.min(width, height) / 2;
    const cx = width / 2;
    const cy = height / 2;
    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <circle 
          cx="${cx}" 
          cy="${cy}" 
          r="${radius - strokeWidth}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
        />
        ${text ? `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#333">${text}</text>` : ''}
      </g>
    `;
  },

  diamond: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = '', fill = '#fff3e0', stroke = '#ff9800', strokeWidth = 2 } = params;
    const cx = width / 2;
    const cy = height / 2;
    const points = `${cx},${strokeWidth} ${width - strokeWidth},${cy} ${cx},${height - strokeWidth} ${strokeWidth},${cy}`;
    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <polygon 
          points="${points}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
        />
        ${text ? `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="10" fill="#333">${text}</text>` : ''}
      </g>
    `;
  },

  hexagon: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = '', fill = '#f3e5f5', stroke = '#9c27b0', strokeWidth = 2 } = params;
    const cx = width / 2;
    const cy = height / 2;
    const rx = (width - strokeWidth * 2) / 2;
    const ry = (height - strokeWidth * 2) / 2;

    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = cx + rx * Math.cos(angle);
      const py = cy + ry * Math.sin(angle);
      points.push(`${px},${py}`);
    }

    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <polygon 
          points="${points.join(' ')}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
        />
        ${text ? `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="10" fill="#333">${text}</text>` : ''}
      </g>
    `;
  },

  ellipse: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = '', fill = '#e1f5fe', stroke = '#00bcd4', strokeWidth = 2 } = params;
    const cx = width / 2;
    const cy = height / 2;
    const rx = (width - strokeWidth * 2) / 2;
    const ry = (height - strokeWidth * 2) / 2;
    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <ellipse 
          cx="${cx}" 
          cy="${cy}" 
          rx="${rx}" 
          ry="${ry}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
        />
        ${text ? `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#333">${text}</text>` : ''}
      </g>
    `;
  },

  triangle: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = '', fill = '#ffebee', stroke = '#f44336', strokeWidth = 2 } = params;
    const cx = width / 2;
    const points = `${cx},${strokeWidth} ${width - strokeWidth},${height - strokeWidth} ${strokeWidth},${height - strokeWidth}`;
    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <polygon 
          points="${points}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
        />
        ${text ? `<text x="${cx}" y="${height * 0.6}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="10" fill="#333">${text}</text>` : ''}
      </g>
    `;
  },

  star: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = '', fill = '#fff8e1', stroke = '#ffc107', strokeWidth = 2 } = params;
    const cx = width / 2;
    const cy = height / 2;
    const outerRadius = Math.min(width, height) / 2 - strokeWidth;
    const innerRadius = outerRadius * 0.4;

    const points = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = cx + radius * Math.cos(angle);
      const py = cy + radius * Math.sin(angle);
      points.push(`${px},${py}`);
    }

    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <polygon 
          points="${points.join(' ')}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
        />
        ${text ? `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="8" fill="#333">${text}</text>` : ''}
      </g>
    `;
  },

  // FLOWCHART SHAPES
  process: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = 'Process', fill = '#e3f2fd', stroke = '#1976d2', strokeWidth = 2 } = params;
    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <rect 
          width="${width}" 
          height="${height}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
          rx="8"
        />
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#333">${text}</text>
      </g>
    `;
  },

  decision: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = '?', fill = '#fff3e0', stroke = '#ff9800', strokeWidth = 2 } = params;
    const cx = width / 2;
    const cy = height / 2;
    const points = `${cx},${strokeWidth} ${width - strokeWidth},${cy} ${cx},${height - strokeWidth} ${strokeWidth},${cy}`;
    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <polygon 
          points="${points}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
        />
        <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#333">${text}</text>
      </g>
    `;
  },

  startEnd: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = 'Start', fill = '#e8f5e8', stroke = '#4caf50', strokeWidth = 2 } = params;
    const rx = height / 2;
    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <rect 
          width="${width}" 
          height="${height}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
          rx="${rx}"
        />
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#333">${text}</text>
      </g>
    `;
  },

  database: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = 'DB', fill = '#f3e5f5', stroke = '#9c27b0', strokeWidth = 2 } = params;
    const ellipseHeight = height * 0.2;
    const bodyHeight = height - ellipseHeight;
    const rx = width / 2 - strokeWidth;
    const ry = ellipseHeight / 2;

    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <!-- Top ellipse -->
        <ellipse cx="${width / 2}" cy="${ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <!-- Body rectangle -->
        <rect x="${strokeWidth}" y="${ry}" width="${width - strokeWidth * 2}" height="${bodyHeight - ry}" fill="${fill}" stroke="none"/>
        <!-- Side lines -->
        <line x1="${strokeWidth}" y1="${ry}" x2="${strokeWidth}" y2="${height - ry}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <line x1="${width - strokeWidth}" y1="${ry}" x2="${width - strokeWidth}" y2="${height - ry}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <!-- Bottom ellipse -->
        <ellipse cx="${width / 2}" cy="${height - ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#333">${text}</text>
      </g>
    `;
  },

  // ARCHITECTURE SHAPES
  server: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = 'Server', fill = '#f5f5f5', stroke = '#757575', strokeWidth = 2 } = params;
    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <rect 
          width="${width}" 
          height="${height}" 
          fill="${fill}" 
          stroke="${stroke}" 
          stroke-width="${strokeWidth}"
          rx="4"
        />
        <!-- Server icon lines -->
        <line x1="${width * 0.1}" y1="${height * 0.3}" x2="${width * 0.9}" y2="${height * 0.3}" stroke="${stroke}" stroke-width="1"/>
        <line x1="${width * 0.1}" y1="${height * 0.5}" x2="${width * 0.9}" y2="${height * 0.5}" stroke="${stroke}" stroke-width="1"/>
        <line x1="${width * 0.1}" y1="${height * 0.7}" x2="${width * 0.9}" y2="${height * 0.7}" stroke="${stroke}" stroke-width="1"/>
        <text x="${width / 2}" y="${height * 0.85}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="10" fill="#333">${text}</text>
      </g>
    `;
  },

  cloud: (params: SVGGeneratorParams): string => {
    const { id, x, y, width, height, text = 'Cloud', fill = '#e1f5fe', stroke = '#00bcd4', strokeWidth = 2 } = params;
    const cx = width / 2;
    const cy = height / 2;

    return `
      <g id="${id}" transform="translate(${x}, ${y})">
        <!-- Cloud shape using multiple circles -->
        <circle cx="${width * 0.25}" cy="${height * 0.6}" r="${height * 0.25}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <circle cx="${width * 0.75}" cy="${height * 0.6}" r="${height * 0.25}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <circle cx="${width * 0.5}" cy="${height * 0.4}" r="${height * 0.3}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <circle cx="${width * 0.15}" cy="${height * 0.45}" r="${height * 0.15}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <circle cx="${width * 0.85}" cy="${height * 0.45}" r="${height * 0.15}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="10" fill="#333">${text}</text>
      </g>
    `;
  },
};
