import { StreamLanguage, StringStream } from '@codemirror/language';

const DIAGRAM_KEYWORDS = new Set([
  'graph',
  'flowchart',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'stateDiagram-v2',
  'erDiagram',
  'gantt',
  'pie',
  'gitGraph',
  'mindmap',
  'timeline',
  'journey',
  'quadrantChart',
  'requirementDiagram',
  'C4Context',
  'C4Container',
  'C4Component',
  'C4Deployment',
  'sankey-beta',
  'block-beta',
  'xychart-beta',
  'packet-beta',
  'kanban',
  'architecture-beta',
]);

const DIRECTION_KEYWORDS = new Set(['TD', 'TB', 'LR', 'RL', 'BT']);

const SECTION_KEYWORDS = new Set([
  'subgraph',
  'end',
  'participant',
  'actor',
  'loop',
  'alt',
  'else',
  'opt',
  'par',
  'critical',
  'break',
  'rect',
  'note',
  'over',
  'activate',
  'deactivate',
  'section',
  'title',
  'dateFormat',
  'axisFormat',
  'class',
  'style',
  'classDef',
  'click',
  'linkStyle',
  'direction',
]);

// Arrow patterns sorted longest-first so greedy match works
// prettier-ignore
const ARROWS = ['===>', '--->', '-.->', '-->', '===', '---', '-.-', '--|', '-.', '--', '->'];

const mermaidMode = {
  startState() {
    return { inString: false, stringChar: '' as string };
  },

  token(stream: StringStream, state: { inString: boolean; stringChar: string }): string | null {
    // Continue string
    if (state.inString) {
      while (!stream.eol()) {
        if (stream.next() === state.stringChar) {
          state.inString = false;
          return 'string';
        }
      }
      return 'string';
    }

    // Skip whitespace
    if (stream.eatSpace()) return null;

    // Comments: %% to end of line
    if (stream.match('%%')) {
      stream.skipToEnd();
      return 'comment';
    }

    // Strings
    const ch = stream.peek();
    if (ch === '"' || ch === "'") {
      state.inString = true;
      state.stringChar = ch;
      stream.next();
      return 'string';
    }

    // Arrows (check before consuming words)
    for (const arrow of ARROWS) {
      if (stream.match(arrow)) return 'operator';
    }

    // Brackets: (()), [[]], {{}}, (), [], {}
    if (
      stream.match('((') ||
      stream.match('))') ||
      stream.match('[[') ||
      stream.match(']]') ||
      stream.match('{{') ||
      stream.match('}}')
    ) {
      return 'bracket';
    }
    if (ch === '(' || ch === ')' || ch === '[' || ch === ']' || ch === '{' || ch === '}') {
      stream.next();
      return 'bracket';
    }

    // Pipe for labels |text|
    if (ch === '|') {
      stream.next();
      return 'operator';
    }

    // Words: check keywords
    if (stream.match(/^[a-zA-Z_][\w-]*/)) {
      const word = stream.current();
      if (DIAGRAM_KEYWORDS.has(word)) return 'keyword';
      if (DIRECTION_KEYWORDS.has(word)) return 'keyword';
      if (SECTION_KEYWORDS.has(word)) return 'keyword';
      return 'variableName';
    }

    // Numbers
    if (stream.match(/^\d+/)) return 'number';

    // Colon, semicolon
    if (ch === ':' || ch === ';') {
      stream.next();
      return 'punctuation';
    }

    // Consume any other character
    stream.next();
    return null;
  },
};

export const mermaidLanguage = StreamLanguage.define(mermaidMode);
