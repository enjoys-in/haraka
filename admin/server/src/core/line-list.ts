// Newline-delimited list files (e.g. config/host_list). Comments (#) preserved.
import { readLines, writeLines } from './files';

export function readList(name: string): string[] {
  return readLines(name)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

export function addToList(name: string, item: string): string[] {
  const lines = readLines(name);
  const exists = lines.some((l) => l.trim().toLowerCase() === item.toLowerCase());
  if (!exists) {
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    lines.push(item);
  }
  writeLines(name, lines);
  return readList(name);
}

export function removeFromList(name: string, item: string): string[] {
  const kept = readLines(name).filter(
    (l) => l.trim().toLowerCase() !== item.toLowerCase()
  );
  writeLines(name, kept);
  return readList(name);
}
