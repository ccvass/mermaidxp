import { ShapeSVGParams } from '../types/shapes.types';

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const withDefaults = (p: ShapeSVGParams) => ({
  ...p,
  x: p.x ?? 0,
  y: p.y ?? 0,
  width: p.width ?? 100,
  height: p.height ?? 60,
  fill: p.fill ?? '#e1f5fe',
  stroke: p.stroke ?? '#0277bd',
  strokeWidth: p.strokeWidth ?? 2,
});

export const textEl = (p: ShapeSVGParams) => {
  const { x, y, width, height, text } = withDefaults(p);
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#111">${esc(
    text || ''
  )}</text>`;
};

export const rectSVG = (p: ShapeSVGParams & { rx?: number; ry?: number; dashed?: boolean }) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const rx = (p as any).rx ?? 0;
  const ry = (p as any).ry ?? 0;
  const dashed = (p as any).dashed ? ` stroke-dasharray="6,4"` : '';
  return `<g id="${id}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${dashed}/>${textEl(
    p
  )}</g>`;
};

export const ellipseSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<g id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${width / 2}" ry="${height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

export const circleSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const r = Math.min(width, height) / 2;
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<g id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

export const diamondSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const points = `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${
    y + height / 2
  }`;
  return `<g id="${id}"><polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

export const cylinderSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const rx = width / 2;
  const ry = Math.max(6, Math.round(height * 0.15));
  const cx = x + width / 2;
  const topY = y + ry;
  const bodyHeight = height - ry * 2;
  return `<g id="${id}">
    <ellipse cx="${cx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    <rect x="${x}" y="${topY}" width="${width}" height="${bodyHeight}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    <ellipse cx="${cx}" cy="${y + height - ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    ${textEl(p)}
  </g>`;
};
