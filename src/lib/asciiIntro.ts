const GLYPHS = '@%#*+=-:0123456789';

/** Fixed-width cells resolve in a broken scan wave, including the empty background. */
export function createAsciiIntroFrame(text: string, progress: number): string {
  if (progress >= 1) return text;
  const lines = text.replaceAll('\r', '').replace(/\n$/, '').split('\n');
  const cols = Math.max(...lines.map(line => line.length));
  const step = Math.floor(Math.max(0, progress) * 40);
  return lines.map((line, row) => Array.from({ length: cols }, (_, col) => {
    const seed = (row * 127 + col * 311 + row * col * 17) % 997;
    const resolveAt = .22 + (row / lines.length) * .42 + (seed / 997) * .32;
    if (progress >= resolveAt) return line[col] ?? ' ';
    return GLYPHS[(seed + step * 7 + Math.floor(step / 3) * col) % GLYPHS.length];
  }).join('')).join('\n');
}
