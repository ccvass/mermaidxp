import { ShapeDefinition, ShapeLibraryConfig, ShapeSVGParams } from '../types/shapes.types';

// Advanced Shape Icons (kept as-is for panel rendering)
const AdvancedShapeIcons = {
  // Business Process Shapes
  Event: () => <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-100" />,
  Gateway: () => <div className="w-6 h-6 transform rotate-45 border-2 border-yellow-500 bg-yellow-100" />,
  Task: () => <div className="w-6 h-4 border-2 border-green-500 bg-green-100 rounded-sm" />,
  Subprocess: () => (
    <div className="w-6 h-4 border-2 border-purple-500 bg-purple-100 rounded-sm relative">
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-purple-500" />
    </div>
  ),

  // AWS/Cloud Shapes
  EC2: () => <div className="w-6 h-6 border-2 border-orange-500 bg-orange-100 rounded" />,
  S3: () => <div className="w-6 h-6 border-2 border-green-600 bg-green-100 rounded-full" />,
  Lambda: () => (
    <div
      className="w-6 h-6 border-2 border-yellow-600 bg-yellow-100"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
    />
  ),
  RDS: () => <div className="w-6 h-6 border-2 border-blue-600 bg-blue-100 rounded-lg" />,
  VPC: () => <div className="w-6 h-6 border-2 border-indigo-500 bg-indigo-100 rounded-lg border-dashed" />,

  // Azure Shapes (icons only for now)
  AzureVM: () => <div className="w-6 h-6 border-2 border-blue-700 bg-blue-100 rounded" />,
  AzureStorage: () => <div className="w-6 h-6 border-2 border-green-700 bg-green-100 rounded-full" />,
  AzureFunction: () => (
    <div
      className="w-6 h-6 border-2 border-yellow-700 bg-yellow-100"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
    />
  ),

  // Google Cloud Shapes (icons only for now)
  GCE: () => <div className="w-6 h-6 border-2 border-red-500 bg-red-100 rounded" />,
  GCS: () => <div className="w-6 h-6 border-2 border-blue-500 bg-blue-100 rounded-full" />,
  CloudFunction: () => (
    <div
      className="w-6 h-6 border-2 border-yellow-500 bg-yellow-100"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
    />
  ),

  // Kubernetes Shapes
  Pod: () => <div className="w-6 h-6 border-2 border-blue-400 bg-blue-100 rounded-lg" />,
  Service: () => <div className="w-6 h-6 border-2 border-green-400 bg-green-100 rounded-full" />,
  Deployment: () => <div className="w-6 h-6 border-2 border-purple-400 bg-purple-100 rounded" />,
  ConfigMap: () => <div className="w-6 h-6 border-2 border-yellow-400 bg-yellow-100 rounded-sm" />,

  // Security Shapes
  Shield: () => (
    <div
      className="w-6 h-6 border-2 border-red-600 bg-red-100"
      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
    />
  ),
  Lock: () => (
    <div className="w-6 h-6 border-2 border-gray-600 bg-gray-100 rounded-sm relative">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-3 h-3 border-2 border-gray-600 rounded-full bg-transparent" />
    </div>
  ),
  Key: () => (
    <div className="w-6 h-6 border-2 border-yellow-600 bg-yellow-100 rounded-full relative">
      <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-1 bg-yellow-600" />
    </div>
  ),

  // Data Flow Shapes
  DataStore: () => (
    <div className="w-6 h-6 border-2 border-indigo-500 bg-indigo-100 rounded-lg relative">
      <div className="absolute inset-1 border border-indigo-400 rounded" />
    </div>
  ),
  Queue: () => (
    <div className="w-6 h-6 border-2 border-purple-500 bg-purple-100 rounded-sm relative">
      <div className="absolute inset-x-1 top-1/2 h-0.5 bg-purple-500" />
    </div>
  ),
  Stream: () => (
    <div className="w-6 h-6 border-2 border-blue-500 bg-blue-100 rounded-full relative">
      <div className="absolute inset-1 border border-blue-400 rounded-full" />
    </div>
  ),

  // Mobile/Web Shapes
  MobileApp: () => <div className="w-4 h-6 border-2 border-gray-600 bg-gray-100 rounded-sm" />,
  WebApp: () => (
    <div className="w-6 h-4 border-2 border-blue-600 bg-blue-100 rounded-sm relative">
      <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 rounded-t-sm" />
    </div>
  ),
  API: () => (
    <div className="w-6 h-6 border-2 border-green-600 bg-green-100 rounded-lg relative">
      <div className="absolute inset-2 text-xs font-bold text-green-600 flex items-center justify-center">API</div>
    </div>
  ),

  // IoT Shapes
  Sensor: () => (
    <div className="w-6 h-6 border-2 border-teal-500 bg-teal-100 rounded-full relative">
      <div className="absolute inset-2 border border-teal-400 rounded-full" />
    </div>
  ),
  Device: () => <div className="w-6 h-6 border-2 border-gray-500 bg-gray-100 rounded" />,
  IoTGateway: () => (
    <div className="w-6 h-6 border-2 border-orange-500 bg-orange-100 rounded-lg relative">
      <div className="absolute inset-1 border border-orange-400 rounded" />
    </div>
  ),
};

// -------------------------
// Local SVG helpers (mirrors of basic helpers)
// -------------------------
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const withDefaults = (p: ShapeSVGParams) => ({
  ...p,
  x: p.x ?? 0,
  y: p.y ?? 0,
  width: p.width ?? 100,
  height: p.height ?? 60,
  fill: p.fill ?? '#e1f5fe',
  stroke: p.stroke ?? '#0277bd',
  strokeWidth: p.strokeWidth ?? 2,
});

const textEl = (p: ShapeSVGParams) => {
  const { x, y, width, height, text } = withDefaults(p);
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#111">${esc(
    text || ''
  )}</text>`;
};

const rectSVG = (p: ShapeSVGParams & { rx?: number; ry?: number; dashed?: boolean }) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const rx = (p as any).rx ?? 0;
  const ry = (p as any).ry ?? 0;
  const dashed = (p as any).dashed ? ` stroke-dasharray="6,4"` : '';
  return `<g id="${id}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${dashed}/>${textEl(
    p
  )}</g>`;
};

const ellipseSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<g id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${width / 2}" ry="${height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const circleSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const r = Math.min(width, height) / 2;
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `<g id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const diamondSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const points = `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${
    y + height / 2
  }`;
  return `<g id="${id}"><polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const triangleSVG = (p: ShapeSVGParams) => {
  const { id, x, y, width, height, fill, stroke, strokeWidth } = withDefaults(p);
  const points = `${x + width / 2},${y} ${x + width},${y + height} ${x},${y + height}`;
  return `<g id="${id}"><polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>${textEl(
    p
  )}</g>`;
};

const cylinderSVG = (p: ShapeSVGParams) => {
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

// Custom small variants used by a few shapes
const subprocessSVG = (p: ShapeSVGParams) => {
  const { x, y, width, height, stroke } = withDefaults(p);
  const base = rectSVG(p);
  const midX = x + width / 2;
  const lineY = y + height - Math.max(4, Math.round(height * 0.15));
  const marker = `<line x1="${midX - 8}" y1="${lineY}" x2="${midX + 8}" y2="${lineY}" stroke="${stroke}" stroke-width="2"/>`;
  return base.replace('</g>', `${marker}</g>`);
};

const queueSVG = (p: ShapeSVGParams) => {
  const { x, y, width, height, stroke } = withDefaults(p);
  const base = rectSVG(p);
  const midY = y + height / 2;
  const line = `<line x1="${x + 6}" y1="${midY}" x2="${x + width - 6}" y2="${midY}" stroke="${stroke}" stroke-width="2"/>`;
  return base.replace('</g>', `${line}</g>`);
};

const webAppSVG = (p: ShapeSVGParams) => {
  const { x, y, width, height, stroke } = withDefaults(p);
  const base = rectSVG(p);
  const barH = Math.max(6, Math.round(height * 0.15));
  const bar = `<rect x="${x}" y="${y}" width="${width}" height="${barH}" fill="${stroke}" opacity="0.85"/>`;
  return base.replace('</g>', `${bar}</g>`);
};

// Business Process Model and Notation (BPMN) Shapes
export const BPMN_SHAPES: ShapeDefinition[] = [
  {
    id: 'bpmn-start-event',
    name: 'Start Event',
    type: 'start-event',
    category: 'business',
    library: 'custom',
    icon: AdvancedShapeIcons.Event,
    svgGenerator: (p) => circleSVG(p),
    description: 'BPMN Start Event',
    tags: ['bpmn', 'start', 'event', 'process', 'business'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 60, height: 60 },
    minSize: { width: 40, height: 40 },
    maxSize: { width: 100, height: 100 },
  },
  {
    id: 'bpmn-end-event',
    name: 'End Event',
    type: 'end-event',
    category: 'business',
    library: 'custom',
    icon: AdvancedShapeIcons.Event,
    svgGenerator: (p) => circleSVG(p),
    description: 'BPMN End Event',
    tags: ['bpmn', 'end', 'event', 'process', 'business'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 60, height: 60 },
    minSize: { width: 40, height: 40 },
    maxSize: { width: 100, height: 100 },
  },
  {
    id: 'bpmn-task',
    name: 'Task',
    type: 'task',
    category: 'business',
    library: 'custom',
    icon: AdvancedShapeIcons.Task,
    svgGenerator: (p) => rectSVG({ ...p, rx: 6, ry: 6 }),
    description: 'BPMN Task/Activity',
    tags: ['bpmn', 'task', 'activity', 'process', 'business'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 120, height: 80 },
    minSize: { width: 80, height: 60 },
    maxSize: { width: 200, height: 120 },
  },
  {
    id: 'bpmn-gateway',
    name: 'Gateway',
    type: 'gateway',
    category: 'business',
    library: 'custom',
    icon: AdvancedShapeIcons.Gateway,
    svgGenerator: (p) => diamondSVG(p),
    description: 'BPMN Gateway (Decision Point)',
    tags: ['bpmn', 'gateway', 'decision', 'process', 'business'],
    isResizable: true,
    isRotatable: true,
    defaultSize: { width: 80, height: 80 },
    minSize: { width: 60, height: 60 },
    maxSize: { width: 120, height: 120 },
  },
  {
    id: 'bpmn-subprocess',
    name: 'Subprocess',
    type: 'subprocess',
    category: 'business',
    library: 'custom',
    icon: AdvancedShapeIcons.Subprocess,
    svgGenerator: (p) => subprocessSVG(p),
    description: 'BPMN Subprocess',
    tags: ['bpmn', 'subprocess', 'process', 'business', 'nested'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 140, height: 90 },
    minSize: { width: 100, height: 70 },
    maxSize: { width: 250, height: 150 },
  },
];

// AWS Cloud Shapes
export const AWS_SHAPES: ShapeDefinition[] = [
  {
    id: 'aws-ec2',
    name: 'EC2 Instance',
    type: 'ec2',
    category: 'cloud',
    library: 'custom',
    icon: AdvancedShapeIcons.EC2,
    svgGenerator: (p) => rectSVG({ ...p, rx: 6, ry: 6 }),
    description: 'AWS EC2 Compute Instance',
    tags: ['aws', 'ec2', 'compute', 'instance', 'cloud'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 80 },
    minSize: { width: 70, height: 60 },
    maxSize: { width: 150, height: 120 },
  },
  {
    id: 'aws-s3',
    name: 'S3 Bucket',
    type: 's3',
    category: 'cloud',
    library: 'custom',
    icon: AdvancedShapeIcons.S3,
    svgGenerator: (p) => ellipseSVG(p),
    description: 'AWS S3 Storage Bucket',
    tags: ['aws', 's3', 'storage', 'bucket', 'cloud'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 90, height: 90 },
    minSize: { width: 60, height: 60 },
    maxSize: { width: 130, height: 130 },
  },
  {
    id: 'aws-lambda',
    name: 'Lambda Function',
    type: 'lambda',
    category: 'cloud',
    library: 'custom',
    icon: AdvancedShapeIcons.Lambda,
    svgGenerator: (p) => triangleSVG(p),
    description: 'AWS Lambda Serverless Function',
    tags: ['aws', 'lambda', 'serverless', 'function', 'cloud'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 80 },
    minSize: { width: 70, height: 60 },
    maxSize: { width: 140, height: 110 },
  },
  {
    id: 'aws-rds',
    name: 'RDS Database',
    type: 'rds',
    category: 'cloud',
    library: 'custom',
    icon: AdvancedShapeIcons.RDS,
    svgGenerator: (p) => cylinderSVG(p),
    description: 'AWS RDS Managed Database',
    tags: ['aws', 'rds', 'database', 'managed', 'cloud'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 120 },
    minSize: { width: 70, height: 90 },
    maxSize: { width: 150, height: 180 },
  },
  {
    id: 'aws-vpc',
    name: 'VPC',
    type: 'vpc',
    category: 'cloud',
    library: 'custom',
    icon: AdvancedShapeIcons.VPC,
    svgGenerator: (p) => rectSVG({ ...p, dashed: true, rx: 8, ry: 8 }),
    description: 'AWS Virtual Private Cloud',
    tags: ['aws', 'vpc', 'network', 'virtual', 'cloud'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 200, height: 150 },
    minSize: { width: 150, height: 100 },
    maxSize: { width: 400, height: 300 },
  },
];

// Kubernetes Shapes
export const KUBERNETES_SHAPES: ShapeDefinition[] = [
  {
    id: 'k8s-pod',
    name: 'Pod',
    type: 'pod',
    category: 'kubernetes',
    library: 'custom',
    icon: AdvancedShapeIcons.Pod,
    svgGenerator: (p) => rectSVG({ ...p, rx: 10, ry: 10 }),
    description: 'Kubernetes Pod',
    tags: ['kubernetes', 'k8s', 'pod', 'container', 'orchestration'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 80, height: 80 },
    minSize: { width: 60, height: 60 },
    maxSize: { width: 120, height: 120 },
  },
  {
    id: 'k8s-service',
    name: 'Service',
    type: 'service',
    category: 'kubernetes',
    library: 'custom',
    icon: AdvancedShapeIcons.Service,
    svgGenerator: (p) => circleSVG(p),
    description: 'Kubernetes Service',
    tags: ['kubernetes', 'k8s', 'service', 'networking', 'orchestration'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 90, height: 90 },
    minSize: { width: 70, height: 70 },
    maxSize: { width: 130, height: 130 },
  },
  {
    id: 'k8s-deployment',
    name: 'Deployment',
    type: 'deployment',
    category: 'kubernetes',
    library: 'custom',
    icon: AdvancedShapeIcons.Deployment,
    svgGenerator: (p) => rectSVG(p),
    description: 'Kubernetes Deployment',
    tags: ['kubernetes', 'k8s', 'deployment', 'orchestration', 'management'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 120, height: 80 },
    minSize: { width: 90, height: 60 },
    maxSize: { width: 180, height: 120 },
  },
  {
    id: 'k8s-configmap',
    name: 'ConfigMap',
    type: 'configmap',
    category: 'kubernetes',
    library: 'custom',
    icon: AdvancedShapeIcons.ConfigMap,
    svgGenerator: (p) => rectSVG(p),
    description: 'Kubernetes ConfigMap',
    tags: ['kubernetes', 'k8s', 'configmap', 'configuration', 'orchestration'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 60 },
    minSize: { width: 80, height: 50 },
    maxSize: { width: 150, height: 90 },
  },
];

// Security Shapes
export const SECURITY_SHAPES: ShapeDefinition[] = [
  {
    id: 'security-firewall',
    name: 'Firewall',
    type: 'firewall',
    category: 'security',
    library: 'custom',
    icon: AdvancedShapeIcons.Shield,
    svgGenerator: (p) => rectSVG(p),
    description: 'Security Firewall',
    tags: ['security', 'firewall', 'protection', 'network', 'defense'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 80 },
    minSize: { width: 70, height: 60 },
    maxSize: { width: 150, height: 120 },
  },
  {
    id: 'security-lock',
    name: 'Encryption',
    type: 'encryption',
    category: 'security',
    library: 'custom',
    icon: AdvancedShapeIcons.Lock,
    svgGenerator: (p) => rectSVG({ ...p, rx: 6, ry: 6 }),
    description: 'Data Encryption',
    tags: ['security', 'encryption', 'lock', 'protection', 'data'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 80, height: 80 },
    minSize: { width: 60, height: 60 },
    maxSize: { width: 120, height: 120 },
  },
  {
    id: 'security-key',
    name: 'Authentication',
    type: 'authentication',
    category: 'security',
    library: 'custom',
    icon: AdvancedShapeIcons.Key,
    svgGenerator: (p) => circleSVG(p),
    description: 'Authentication Service',
    tags: ['security', 'authentication', 'key', 'access', 'identity'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 70 },
    minSize: { width: 80, height: 50 },
    maxSize: { width: 140, height: 100 },
  },
];

// Data Flow Shapes
export const DATA_FLOW_SHAPES: ShapeDefinition[] = [
  {
    id: 'data-store',
    name: 'Data Store',
    type: 'data-store',
    category: 'data',
    library: 'custom',
    icon: AdvancedShapeIcons.DataStore,
    svgGenerator: (p) => cylinderSVG(p),
    description: 'Data Storage System',
    tags: ['data', 'storage', 'database', 'repository', 'persistence'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 120, height: 80 },
    minSize: { width: 90, height: 60 },
    maxSize: { width: 180, height: 120 },
  },
  {
    id: 'data-queue',
    name: 'Message Queue',
    type: 'queue',
    category: 'data',
    library: 'custom',
    icon: AdvancedShapeIcons.Queue,
    svgGenerator: (p) => queueSVG(p),
    description: 'Message Queue System',
    tags: ['data', 'queue', 'messaging', 'async', 'communication'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 120, height: 60 },
    minSize: { width: 90, height: 50 },
    maxSize: { width: 180, height: 90 },
  },
  {
    id: 'data-stream',
    name: 'Data Stream',
    type: 'stream',
    category: 'data',
    library: 'custom',
    icon: AdvancedShapeIcons.Stream,
    svgGenerator: (p) => circleSVG(p),
    description: 'Real-time Data Stream',
    tags: ['data', 'stream', 'realtime', 'flow', 'processing'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 100 },
    minSize: { width: 80, height: 80 },
    maxSize: { width: 140, height: 140 },
  },
];

// Mobile/Web Application Shapes
export const APPLICATION_SHAPES: ShapeDefinition[] = [
  {
    id: 'mobile-app',
    name: 'Mobile App',
    type: 'mobile-app',
    category: 'application',
    library: 'custom',
    icon: AdvancedShapeIcons.MobileApp,
    svgGenerator: (p) => rectSVG({ ...p, rx: 8, ry: 8 }),
    description: 'Mobile Application',
    tags: ['mobile', 'app', 'application', 'ios', 'android'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 60, height: 100 },
    minSize: { width: 50, height: 80 },
    maxSize: { width: 90, height: 150 },
  },
  {
    id: 'web-app',
    name: 'Web Application',
    type: 'web-app',
    category: 'application',
    library: 'custom',
    icon: AdvancedShapeIcons.WebApp,
    svgGenerator: (p) => webAppSVG(p),
    description: 'Web Application',
    tags: ['web', 'app', 'application', 'browser', 'frontend'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 120, height: 80 },
    minSize: { width: 90, height: 60 },
    maxSize: { width: 180, height: 120 },
  },
  {
    id: 'api-service',
    name: 'API Service',
    type: 'api',
    category: 'application',
    library: 'custom',
    icon: AdvancedShapeIcons.API,
    svgGenerator: (p) => rectSVG({ ...p, rx: 6, ry: 6 }),
    description: 'API Service/Endpoint',
    tags: ['api', 'service', 'endpoint', 'rest', 'graphql'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 80 },
    minSize: { width: 80, height: 60 },
    maxSize: { width: 140, height: 110 },
  },
];

// IoT (Internet of Things) Shapes
export const IOT_SHAPES: ShapeDefinition[] = [
  {
    id: 'iot-sensor',
    name: 'IoT Sensor',
    type: 'sensor',
    category: 'iot',
    library: 'custom',
    icon: AdvancedShapeIcons.Sensor,
    svgGenerator: (p) => circleSVG(p),
    description: 'IoT Sensor Device',
    tags: ['iot', 'sensor', 'device', 'monitoring', 'data'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 70, height: 70 },
    minSize: { width: 50, height: 50 },
    maxSize: { width: 100, height: 100 },
  },
  {
    id: 'iot-device',
    name: 'IoT Device',
    type: 'device',
    category: 'iot',
    library: 'custom',
    icon: AdvancedShapeIcons.Device,
    svgGenerator: (p) => rectSVG(p),
    description: 'IoT Connected Device',
    tags: ['iot', 'device', 'connected', 'smart', 'edge'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 80, height: 80 },
    minSize: { width: 60, height: 60 },
    maxSize: { width: 120, height: 120 },
  },
  {
    id: 'iot-gateway',
    name: 'IoT Gateway',
    type: 'gateway',
    category: 'iot',
    library: 'custom',
    icon: AdvancedShapeIcons.IoTGateway,
    svgGenerator: (p) => rectSVG({ ...p, rx: 8, ry: 8 }),
    description: 'IoT Gateway/Hub',
    tags: ['iot', 'gateway', 'hub', 'connectivity', 'edge'],
    isResizable: true,
    isRotatable: false,
    defaultSize: { width: 100, height: 80 },
    minSize: { width: 80, height: 60 },
    maxSize: { width: 140, height: 110 },
  },
];

// Advanced Shape Libraries Configuration
export const ADVANCED_SHAPE_LIBRARIES: ShapeLibraryConfig[] = [
  {
    name: 'BPMN Shapes',
    version: '1.0.0',
    shapes: BPMN_SHAPES,
    categories: ['business'],
    isEnabled: true,
    loadPriority: 6,
  },
  {
    name: 'AWS Cloud Shapes',
    version: '1.0.0',
    shapes: AWS_SHAPES,
    categories: ['cloud'],
    isEnabled: true,
    loadPriority: 7,
  },
  {
    name: 'Kubernetes Shapes',
    version: '1.0.0',
    shapes: KUBERNETES_SHAPES,
    categories: ['kubernetes'],
    isEnabled: true,
    loadPriority: 8,
  },
  {
    name: 'Security Shapes',
    version: '1.0.0',
    shapes: SECURITY_SHAPES,
    categories: ['security'],
    isEnabled: true,
    loadPriority: 9,
  },
  {
    name: 'Data Flow Shapes',
    version: '1.0.0',
    shapes: DATA_FLOW_SHAPES,
    categories: ['data'],
    isEnabled: true,
    loadPriority: 10,
  },
  {
    name: 'Application Shapes',
    version: '1.0.0',
    shapes: APPLICATION_SHAPES,
    categories: ['application'],
    isEnabled: true,
    loadPriority: 11,
  },
  {
    name: 'IoT Shapes',
    version: '1.0.0',
    shapes: IOT_SHAPES,
    categories: ['iot'],
    isEnabled: true,
    loadPriority: 12,
  },
];

// Export all shapes combined
export const ALL_ADVANCED_SHAPES = [
  ...BPMN_SHAPES,
  ...AWS_SHAPES,
  ...KUBERNETES_SHAPES,
  ...SECURITY_SHAPES,
  ...DATA_FLOW_SHAPES,
  ...APPLICATION_SHAPES,
  ...IOT_SHAPES,
];
