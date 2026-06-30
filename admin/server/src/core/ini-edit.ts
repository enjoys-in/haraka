// Comment-preserving INI key editing. section === '' targets the top region.
import { readLines, writeLines } from './files';

function sectionHeader(line: string): string | null {
  const m = line.match(/^\s*\[(.+?)\]\s*$/);
  return m ? m[1] : null;
}

function keyOnLine(line: string): string | null {
  const m = line.replace(/^\s*#?\s*/, '').match(/^([^=:\s]+)\s*[=:]/);
  return m ? m[1] : null;
}

export function setIniKey(name: string, section: string, key: string, value: string): void {
  const lines = readLines(name);
  let cur = '';
  let targetEnd = -1;
  let replaced = false;

  for (let i = 0; i < lines.length; i++) {
    const hdr = sectionHeader(lines[i]);
    if (hdr !== null) {
      cur = hdr;
      continue;
    }
    if (cur === section) {
      targetEnd = i;
      if (!replaced && keyOnLine(lines[i]) === key) {
        const sep = / = /.test(lines[i]) ? ' = ' : '=';
        lines[i] = `${key}${sep}${value}`;
        replaced = true;
      }
    }
  }

  if (!replaced) {
    const entry = `${key}=${value}`;
    if (section === '') {
      lines.unshift(entry);
    } else if (targetEnd >= 0) {
      lines.splice(targetEnd + 1, 0, entry);
    } else {
      if (lines.length && lines[lines.length - 1].trim() !== '') lines.push('');
      lines.push(`[${section}]`, entry);
    }
  }
  writeLines(name, lines);
}

export function deleteIniKey(name: string, section: string, key: string): void {
  const lines = readLines(name);
  let cur = '';
  const kept: string[] = [];
  for (const line of lines) {
    const hdr = sectionHeader(line);
    if (hdr !== null) {
      cur = hdr;
      kept.push(line);
      continue;
    }
    if (cur === section && keyOnLine(line) === key) continue;
    kept.push(line);
  }
  writeLines(name, kept);
}

// Remove an entire [section] header and every line belonging to it, up to the
// next section header or EOF. The top region (section === '') cannot be removed.
export function deleteIniSection(name: string, section: string): void {
  if (!section) return;
  const lines = readLines(name);
  const kept: string[] = [];
  let dropping = false;
  for (const line of lines) {
    const hdr = sectionHeader(line);
    if (hdr !== null) {
      dropping = hdr === section;
      if (dropping) continue;
    }
    if (dropping) continue;
    kept.push(line);
  }
  writeLines(name, kept);
}

