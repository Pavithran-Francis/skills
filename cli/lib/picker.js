/**
 * Custom skill picker — grid layout, full description panel for focused skill.
 * Navigation: ↑↓←→  space=toggle  a=all  enter=confirm  esc=back
 */
import ansis from 'ansis';
import { skillColor, white, muted, success, brand, warn } from './theme.js';

const KEY = {
  UP:     '\x1b[A',
  DOWN:   '\x1b[B',
  RIGHT:  '\x1b[C',
  LEFT:   '\x1b[D',
  SPACE:  ' ',
  ENTER:  '\r',
  CTRL_C: '\x03',
  ESC:    '\x1b',
};

function wordWrap(text, width) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (cur && cur.length + 1 + w.length > width) { lines.push(cur); cur = w; }
    else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function skillPicker({ message, options }) {
  const termW = process.stdout.columns || 100;
  const termH = process.stdout.rows    || 40;

  // Grid dimensions
  const maxName = Math.max(...options.map(o => o.label.length));
  const colW    = maxName + 6;                             // □ name + padding
  const numCols = Math.max(1, Math.floor((termW - 2) / colW));
  const numRows = Math.ceil(options.length / numCols);

  // Layout heights — DESC_H is computed dynamically per render from wrapped lines
  const HEADER = 2;
  const GRID_H = numRows;
  const SEP    = 1;
  const FOOTER = 1;

  let cursor = 0;
  const sel  = new Set();
  let lastLines = 0;

  function clamp(c) {
    return Math.max(0, Math.min(options.length - 1, c));
  }

  function renderGrid() {
    const lines = [];

    // Header
    lines.push(brand('◆') + '  ' + ansis.bold(white(message)) +
      muted('  ↑↓←→ navigate · space toggle · a=all · enter confirm · esc back'));
    lines.push(muted('│'));

    // Grid rows
    for (let r = 0; r < numRows; r++) {
      let row = muted('│') + ' ';
      for (let c = 0; c < numCols; c++) {
        const idx = r * numCols + c;
        if (idx >= options.length) break;
        const opt     = options[idx];
        const focused = idx === cursor;
        const checked = sel.has(idx);
        const box     = checked ? success('■') : muted('□');
        const arrow   = focused ? ansis.bold(ansis.white('▶')) : ' ';
        const label   = focused
          ? ansis.bold(ansis.white(opt.label))
          : skillColor(idx)(opt.label);
        const cell = `${arrow}${box} ${label}`;
        // Pad to colW (accounting for invisible ANSI chars: pad by name length, not cell length)
        const visLen   = 3 + opt.label.length;           // arrow(1) + box(1) + space(1) + name
        const pad      = Math.max(0, colW - visLen);
        row += cell + ' '.repeat(pad);
      }
      lines.push(row);
    }

    // Separator + full description — all lines, no cap
    const focused = options[cursor];
    const desc    = focused?.description ?? '';
    const wrapW   = Math.min(termW - 6, 72);
    const wrapped = desc ? wordWrap(desc, wrapW) : [''];

    lines.push(muted('├' + '─'.repeat(Math.min(termW - 2, 78)) + '┤'));
    for (const line of wrapped) {
      lines.push(muted('│ ') + white(line));
    }

    // Footer
    const selCount = sel.size;
    lines.push(
      '  ' + (selCount > 0 ? success(`${selCount} selected`) : muted('0 selected')) +
      muted(`  ·  ${cursor + 1} of ${options.length}`)
    );

    return lines;
  }

  function draw() {
    const lines = renderGrid();
    if (lastLines > 0) process.stdout.write(`\x1b[${lastLines}A`);
    for (const line of lines) {
      process.stdout.write('\x1b[2K' + line + '\n');
    }
    // Erase any leftover content from a previously taller render
    process.stdout.write('\x1b[0J');
    lastLines = lines.length;
  }

  // Initial draw
  draw();

  return new Promise((resolve, reject) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function cleanup() {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeAllListeners('data');
    }

    function cancel() {
      cleanup();
      reject(Object.assign(new Error('cancel'), { isCancel: true }));
    }

    process.stdin.on('data', key => {
      const row = Math.floor(cursor / numCols);
      const col = cursor % numCols;

      if (key === KEY.CTRL_C) { cleanup(); process.exit(0); }
      if (key === KEY.ESC)    { cancel(); return; }

      if (key === KEY.UP)    cursor = clamp((row - 1) * numCols + col);
      if (key === KEY.DOWN)  cursor = clamp((row + 1) * numCols + col);
      if (key === KEY.LEFT)  cursor = clamp(cursor - 1);
      if (key === KEY.RIGHT) cursor = clamp(cursor + 1);

      if (key === KEY.SPACE) {
        sel.has(cursor) ? sel.delete(cursor) : sel.add(cursor);
      }
      if (key === 'a' || key === 'A') {
        sel.size === options.length
          ? sel.clear()
          : options.forEach((_, i) => sel.add(i));
      }
      if (key === KEY.ENTER) {
        if (!sel.size) return;
        cleanup();
        // Clear entire picker block then write compact confirmation
        if (lastLines > 0) process.stdout.write(`\x1b[${lastLines}A\x1b[0J`);
        process.stdout.write(success('◆') + '  ' +
          white(`${sel.size} skill(s) selected`) + '\n');
        resolve([...sel].sort((a, b) => a - b).map(i => options[i].value));
        return;
      }

      draw();
    });
  });
}
