import ansis from 'ansis';
import { skillColor, white, muted, success, brand } from './theme.js';

const UP      = '\x1b[A';
const DOWN    = '\x1b[B';
const SPACE   = ' ';
const ENTER   = '\r';
const CTRL_C  = '\x03';
const ESC     = '\x1b';

const clr  = () => process.stdout.write('\x1b[2K');
const up   = n => process.stdout.write(`\x1b[${n}A`);
const nl   = ()  => process.stdout.write('\n');

function wordWrap(text, width) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if (line && line.length + 1 + w.length > width) { lines.push(line); line = w; }
    else line = line ? `${line} ${w}` : w;
  }
  if (line) lines.push(line);
  return lines;
}

function writeLine(s = '') {
  clr();
  process.stdout.write(s + '\n');
}

export async function skillPicker({ message, options }) {
  const termW   = process.stdout.columns || 100;
  const termH   = process.stdout.rows    || 30;

  const DESC_LINES  = 3;
  const FOOTER_LINES = 2;
  const HEADER_LINES = 2;
  const VISIBLE = Math.min(options.length, Math.max(6, termH - HEADER_LINES - 1 - DESC_LINES - FOOTER_LINES));

  let cursor    = 0;
  let scrollTop = 0;
  const sel     = new Set();

  function ensureVisible() {
    if (cursor < scrollTop) scrollTop = cursor;
    if (cursor >= scrollTop + VISIBLE) scrollTop = cursor - VISIBLE + 1;
  }

  function render(first = false) {
    const totalLines = HEADER_LINES + VISIBLE + 1 + DESC_LINES + FOOTER_LINES;
    if (!first) { up(totalLines); }

    // Header
    writeLine(brand('◆') + '  ' + white(message));
    writeLine(muted('│'));

    // Skill list
    for (let i = 0; i < VISIBLE; i++) {
      const idx = scrollTop + i;
      if (idx >= options.length) { writeLine(muted('│')); continue; }
      const opt       = options[idx];
      const focused   = idx === cursor;
      const checked   = sel.has(idx);
      const bullet    = checked ? success('■') : muted('□');
      const nameStr   = focused
        ? ansis.bold(skillColor(idx)(opt.label))
        : skillColor(idx)(opt.label);
      const cursor_   = focused ? brand('▶') : ' ';
      writeLine(`${muted('│')} ${cursor_} ${bullet} ${nameStr}`);
    }

    // Separator + description panel
    const divW = Math.min(termW - 2, 72);
    writeLine(muted('├' + '─'.repeat(divW) + '┤'));

    const focused = options[cursor];
    const desc    = focused?.description || '';
    const descW   = termW - 6;
    const wrapped = desc ? wordWrap(desc, descW) : [];

    for (let i = 0; i < DESC_LINES; i++) {
      const line = wrapped[i] ?? '';
      writeLine(muted('│ ') + white(line));
    }

    // Footer
    const scrollHint = options.length > VISIBLE
      ? muted(`  ${scrollTop + 1}–${Math.min(scrollTop + VISIBLE, options.length)} of ${options.length}`)
      : '';
    writeLine(muted('│'));
    writeLine(
      muted('  ↑↓ navigate') + '  ' +
      muted('space toggle') + '  ' +
      muted('a = all') + '  ' +
      success(`${sel.size} selected`) + '  ' +
      muted('enter confirm') + '  ' +
      muted('esc back') +
      scrollHint
    );
  }

  // Reserve space
  process.stdout.write('\n'.repeat(HEADER_LINES + VISIBLE + 1 + DESC_LINES + FOOTER_LINES));
  render(false);

  return new Promise((resolve, reject) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function done(result) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeAllListeners('data');
      if (result !== null) {
        nl();
        process.stdout.write(success('◆') + '  ' + white(`${result.length} skill(s) selected`) + '\n');
      }
      resolve(result);
    }

    process.stdin.on('data', key => {
      if (key === CTRL_C) { done(null); reject(Object.assign(new Error('cancel'), { isCancel: true })); return; }
      if (key === ESC)    { done(null); reject(Object.assign(new Error('cancel'), { isCancel: true })); return; }

      if (key === UP) {
        if (cursor > 0) { cursor--; ensureVisible(); }
      } else if (key === DOWN) {
        if (cursor < options.length - 1) { cursor++; ensureVisible(); }
      } else if (key === SPACE) {
        sel.has(cursor) ? sel.delete(cursor) : sel.add(cursor);
      } else if (key === 'a' || key === 'A') {
        sel.size === options.length
          ? sel.clear()
          : options.forEach((_, i) => sel.add(i));
      } else if (key === ENTER) {
        if (!sel.size) return;
        done([...sel].sort((a, b) => a - b).map(i => options[i].value));
        return;
      }

      render(false);
    });
  });
}
