/**
 * Single-select in-place picker — renders in-place like skillPicker.
 * Resolves with selected value. Throws { isCancel: true } on ESC.
 */
import ansis from 'ansis';
import { brand, white, muted } from './theme.js';

const KEY = {
  UP:     '\x1b[A',
  DOWN:   '\x1b[B',
  ENTER:  '\r',
  CTRL_C: '\x03',
  ESC:    '\x1b',
};

function formatHints(str) {
  return '  ' + brand('►► ') + str.split(' · ').map(part => {
    const [key, ...rest] = part.trim().split(' ');
    return ansis.bold(ansis.white(key)) + (rest.length ? muted(' ' + rest.join(' ')) : '');
  }).join(muted('  ·  '));
}

export async function inlineSelect({ message, hint = '↑↓ navigate · enter select · esc back', options }) {
  let cursor = 0;
  let lastLines = 0;

  function renderLines() {
    const out = [];
    // Title line — no hints here (moved to footer bar)
    out.push(brand('◆') + '  ' + ansis.bold(white(message)));
    out.push(muted('│'));
    for (let i = 0; i < options.length; i++) {
      const focused = i === cursor;
      const arrow   = focused ? ansis.bold(ansis.white('▶')) : ' ';
      const label   = focused
        ? ansis.bold(ansis.white(options[i].label))
        : muted(options[i].label);
      const desc    = options[i].hint ? '  ' + muted(options[i].hint) : '';
      out.push(muted('│') + '  ' + arrow + ' ' + label + desc);
    }
    out.push(muted('│'));
    // Dedicated hint footer bar
    out.push(formatHints(hint));
    return out;
  }

  function draw() {
    const lines = renderLines();
    if (lastLines > 0) process.stdout.write(`\x1b[${lastLines}A`);
    for (const l of lines) process.stdout.write('\x1b[2K' + l + '\n');
    process.stdout.write('\x1b[0J');
    lastLines = lines.length;
  }

  function clearBlock() {
    if (lastLines > 0) {
      process.stdout.write(`\x1b[${lastLines}A\x1b[0J`);
      lastLines = 0;
    }
  }

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

    process.stdin.on('data', key => {
      if (key === KEY.CTRL_C) { cleanup(); process.exit(0); }

      if (key === KEY.ESC) {
        cleanup();
        clearBlock();
        reject(Object.assign(new Error('cancel'), { isCancel: true }));
        return;
      }

      if (key === KEY.UP)   cursor = Math.max(0, cursor - 1);
      if (key === KEY.DOWN) cursor = Math.min(options.length - 1, cursor + 1);

      if (key === KEY.ENTER) {
        cleanup();
        clearBlock();
        resolve(options[cursor].value);
        return;
      }

      draw();
    });
  });
}
