export interface ParsedSheet {
  title: string;
  code: string;
}

/**
 * Parse a markdown string and extract mermaid code blocks as sheets.
 * Each ```mermaid block becomes a sheet. The title is taken from the
 * nearest preceding heading, or "Sheet N" as fallback.
 */
export function parseMdToSheets(md: string): ParsedSheet[] {
  const sheets: ParsedSheet[] = [];
  const lines = md.split('\n');
  let lastHeading = '';
  let inBlock = false;
  let blockLines: string[] = [];
  let sheetCount = 0;

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)/);
    if (headingMatch && !inBlock) {
      lastHeading = headingMatch[1].trim();
    }

    if (!inBlock && line.trim().startsWith('```mermaid')) {
      inBlock = true;
      blockLines = [];
      continue;
    }

    if (inBlock && line.trim() === '```') {
      inBlock = false;
      sheetCount++;
      const code = blockLines.join('\n').trim();
      if (code) {
        sheets.push({
          title: lastHeading || `Sheet ${sheetCount}`,
          code,
        });
      }
      lastHeading = '';
      continue;
    }

    if (inBlock) {
      blockLines.push(line);
    }
  }

  return sheets;
}
