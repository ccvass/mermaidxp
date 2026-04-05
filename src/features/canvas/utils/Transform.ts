import { logger } from '../../../utils/logger';
/**
 * Transform utility for handling canvas transformations
 * Supports uniform scaling and translation
 */

export interface Point {
  x: number;
  y: number;
}

export interface TransformMatrix {
  a: number; // scale x
  b: number; // skew y
  c: number; // skew x
  d: number; // scale y
  e: number; // translate x
  f: number; // translate y
}

export class Transform {
  public readonly scaleX: number;
  public readonly scaleY: number;
  public readonly translateX: number;
  public readonly translateY: number;

  constructor(scale: number = 1, translateX: number = 0, translateY: number = 0) {
    // Validate inputs
    this.scaleX = typeof scale === 'number' && !isNaN(scale) && scale > 0 ? scale : 1;
    this.scaleY = this.scaleX; // Uniform scaling
    this.translateX = typeof translateX === 'number' && !isNaN(translateX) ? translateX : 0;
    this.translateY = typeof translateY === 'number' && !isNaN(translateY) ? translateY : 0;
  }

  /**
   * Create a Transform from separate scale and pan values
   * @param scale - Scale factor
   * @param pan - Pan offset with x and y coordinates
   * @returns Transform instance
   */
  static fromScaleAndPan(scale: number, pan: Point): Transform {
    // Validar parámetros
    const safeScale = typeof scale === 'number' && !isNaN(scale) && scale > 0 ? scale : 1;
    const safePan =
      pan &&
      typeof pan === 'object' &&
      typeof pan.x === 'number' &&
      typeof pan.y === 'number' &&
      !isNaN(pan.x) &&
      !isNaN(pan.y)
        ? pan
        : { x: 0, y: 0 };

    return new Transform(safeScale, safePan.x, safePan.y);
  }

  /**
   * Create a Transform from a transformation matrix
   */
  static fromMatrix(matrix: TransformMatrix): Transform {
    // Extract scale and translation from matrix
    // Assuming uniform scaling (a = d) and no skewing (b = c = 0)
    return new Transform(matrix.a, matrix.e, matrix.f);
  }

  /**
   * Create an identity transform
   */
  static identity(): Transform {
    return new Transform(1, 0, 0);
  }

  /**
   * Apply this transform to an HTML element using CSS transform
   * @param element - HTML element to transform
   */
  applyToElement(element: HTMLElement): void {
    if (!element) {
      return;
    }

    try {
      const transformString = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scaleX})`;
      element.style.transform = transformString;
      element.style.transformOrigin = '0 0';
    } catch (error) {
      logger.error('Error applying transform to element:', 'Transform', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Apply this transform to an SVG element or group
   * @param element - SVG element to transform
   */
  applySVGGroup(element: SVGElement): void {
    if (!element) {
      return;
    }

    try {
      // For SVG elements, we apply the transform directly to avoid nesting issues
      if (element.tagName.toLowerCase() === 'svg') {
        // Ensure SVG has proper styling to avoid transparency
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.display = 'block';

        // Remove any filters or effects that might cause transparency
        element.style.filter = 'none';
        element.style.mixBlendMode = 'normal';

        // Find or create a transform group inside the SVG
        let transformGroup = element.querySelector('g[data-transform-group="true"]') as SVGGElement;

        if (!transformGroup) {
          // Create transform group and move all children into it
          transformGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          transformGroup.setAttribute('data-transform-group', 'true');

          // Move all existing children to the transform group
          const children = Array.from(element.children);
          children.forEach((child) => {
            if (child !== transformGroup && child.getAttribute('data-transform-group') !== 'true') {
              transformGroup.appendChild(child);
            }
          });

          element.appendChild(transformGroup);
        }

        // Ensure transform group has proper styling
        transformGroup.style.opacity = '1';
        transformGroup.style.visibility = 'visible';

        // Ensure all child elements are fully opaque
        const allChildren = transformGroup.querySelectorAll('*');
        allChildren.forEach((child) => {
          if (child instanceof SVGElement && child.style) {
            // Only set opacity if it's not already set or if it's less than 1
            if (!child.style.opacity || parseFloat(child.style.opacity) < 1) {
              child.style.opacity = '1';
            }
            child.style.visibility = 'visible';
          }
        });

        // Apply transform to the group with proper SVG coordinate system
        const transformString = `translate(${this.translateX}, ${this.translateY}) scale(${this.scaleX})`;
        transformGroup.setAttribute('transform', transformString);
      } else {
        // For other SVG elements, apply transform directly
        const transformString = `translate(${this.translateX}, ${this.translateY}) scale(${this.scaleX})`;
        element.setAttribute('transform', transformString);

        // Ensure element visibility
        if (element.style) {
          element.style.opacity = '1';
          element.style.visibility = 'visible';
        }
      }
    } catch (error) {
      logger.error('Error applying SVG transform:', 'Transform', error instanceof Error ? error : undefined);
      // Fallback: apply transform directly to the element
      try {
        const transformString = `translate(${this.translateX}, ${this.translateY}) scale(${this.scaleX})`;
        element.setAttribute('transform', transformString);

        // Ensure visibility in fallback
        if (element.style) {
          element.style.opacity = '1';
          element.style.visibility = 'visible';
        }
      } catch (fallbackError) {
        logger.error(
          'Error applying fallback SVG transform:',
          'Transform',
          fallbackError instanceof Error ? fallbackError : undefined
        );
      }
    }
  }

  /**
   * Apply this transform to a canvas rendering context
   * This mutates the CanvasRenderingContext2D
   */
  apply(ctx: CanvasRenderingContext2D): void {
    if (!ctx) {
      return;
    }

    try {
      // Reset transform to identity first to avoid cumulative errors
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Apply our transform: translate then scale
      ctx.translate(this.translateX, this.translateY);
      ctx.scale(this.scaleX, this.scaleX);
    } catch (error) {
      logger.error('Error applying canvas transform:', 'Transform', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Apply this transform to an SVG element
   */
  applySVG(element: SVGGraphicsElement): void {
    if (!element) {
      return;
    }

    try {
      // Apply transform with consistent order: translate then scale
      const transformValue = `translate(${this.translateX}, ${this.translateY}) scale(${this.scaleX})`;
      element.setAttribute('transform', transformValue);
    } catch (error) {
      logger.error('Error applying SVG transform:', 'Transform', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  toScreen(worldPoint: Point): Point {
    return {
      x: worldPoint.x * this.scaleX + this.translateX,
      y: worldPoint.y * this.scaleY + this.translateY, // Fixed: use scaleY for Y coordinate
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  toWorld(screenPoint: Point): Point {
    return {
      x: (screenPoint.x - this.translateX) / this.scaleX,
      y: (screenPoint.y - this.translateY) / this.scaleY, // Fixed: use scaleY for Y coordinate
    };
  }

  /**
   * Get the transformation matrix representation
   */
  getMatrix(): TransformMatrix {
    return {
      a: this.scaleX, // scale x
      b: 0, // skew y
      c: 0, // skew x
      d: this.scaleX, // scale y (uniform scaling)
      e: this.translateX, // translate x
      f: this.translateY, // translate y
    };
  }

  /**
   * Get the scale factor
   */
  getScale(): number {
    return this.scaleX;
  }

  /**
   * Get the translation as a Point
   */
  getTranslation(): Point {
    return { x: this.translateX, y: this.translateY };
  }

  /**
   * Create a new Transform with different translation
   */
  setTranslation(translation: Point): Transform {
    return new Transform(this.scaleX, translation.x, translation.y);
  }

  /**
   * Create a new Transform with relative translation
   */
  translate(delta: Point): Transform {
    return new Transform(this.scaleX, this.translateX + delta.x, this.translateY + delta.y);
  }

  /**
   * Create a new Transform with different scale
   */
  zoom(scaleFactor: number): Transform {
    return new Transform(this.scaleX * scaleFactor, this.translateX, this.translateY);
  }

  /**
   * Create a new Transform zoomed at a specific point
   */
  zoomAt(scaleFactor: number, centerPoint: Point): Transform {
    // New scale factor
    const newScale = this.scaleX * scaleFactor;

    // Calculate new translation to keep the center point fixed
    const newTranslateX = centerPoint.x - (centerPoint.x - this.translateX) * scaleFactor;
    const newTranslateY = centerPoint.y - (centerPoint.y - this.translateY) * scaleFactor;

    return new Transform(newScale, newTranslateX, newTranslateY);
  }

  /**
   * Linear interpolation between this transform and another
   */
  lerp(other: Transform, t: number): Transform {
    const scale = this.scaleX + (other.scaleX - this.scaleX) * t;
    const translateX = this.translateX + (other.translateX - this.translateX) * t;
    const translateY = this.translateY + (other.translateY - this.translateY) * t;
    return new Transform(scale, translateX, translateY);
  }

  /**
   * Check if this transform equals another within tolerance
   */
  equals(other: Transform, tolerance: number = 1e-6): boolean {
    return (
      Math.abs(this.scaleX - other.scaleX) < tolerance &&
      Math.abs(this.translateX - other.translateX) < tolerance &&
      Math.abs(this.translateY - other.translateY) < tolerance
    );
  }

  /**
   * Create a copy of this transform
   */
  clone(): Transform {
    return new Transform(this.scaleX, this.translateX, this.translateY);
  }

  /**
   * String representation for debugging
   */
  toString(): string {
    return `Transform(scale: ${this.scaleX.toFixed(3)}, translate: ${this.translateX.toFixed(3)}, ${this.translateY.toFixed(3)})`;
  }
}
