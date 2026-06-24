import ansis from 'ansis';
import { muted } from './theme.js';
import { REPO } from './constants.js';

const CLAUDE_LINES = [
  ' ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗',
  '██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝',
  '██║     ██║     ███████║██║   ██║██║  ██║█████╗  ',
  '██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝  ',
  '╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗',
  ' ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝',
];

const SKILLS_LINES = [
  '███████╗██╗  ██╗██╗██╗     ██╗     ███████╗',
  '██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝',
  '███████╗█████╔╝ ██║██║     ██║     ███████╗',
  '╚════██║██╔═██╗ ██║██║     ██║     ╚════██║',
  '███████║██║  ██╗██║███████╗███████╗███████║',
  '╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝',
];

const ART = [...CLAUDE_LINES, ...SKILLS_LINES];
const MAX_WIDTH = Math.max(...ART.map(l => l.length));

// One pride stripe per art line (12 lines → 2 lines per colour)
const PRIDE = [
  [220,  30,  30], // red
  [220,  30,  30],
  [255, 140,   0], // orange
  [255, 140,   0],
  [255, 210,   0], // yellow
  [255, 210,   0],
  [ 30, 185,  30], // green
  [ 30, 185,  30],
  [ 30, 100, 255], // blue
  [ 30, 100, 255],
  [150,  30, 230], // purple
  [150,  30, 230],
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const col   = (r, g, b) => s => ansis.rgb(Math.round(r), Math.round(g), Math.round(b))(s);
const up    = n => process.stdout.write(`\x1b[${n}A`);
const wline = s => process.stdout.write(`\x1b[2K${s}\n`);

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

/** Sheen sweep: all chars glow pride → white at the core → pride → dim */
function sheenColor(_ch, dist, [r, g, b]) {
  if (dist <=  1) return col(255, 255, 255);                                      // white-hot core
  if (dist <=  3) return col(clamp(r*1.1+60), clamp(g*1.1+60), clamp(b*1.1+60)); // bright pride
  if (dist <=  8) return col(r, g, b);                                            // pure pride
  if (dist <= 15) return col(r * 0.7, g * 0.7, b * 0.7);                         // dimmed
  return col(r * 0.45, g * 0.45, b * 0.45);                                      // dark base
}

/** Static settled state: sine-arc so centre is brightest (metallic highlight) */
function staticColor(_ch, i, len, [r, g, b]) {
  const arc = Math.sin((i / (len - 1 || 1)) * Math.PI); // 0 at edges, 1 at centre
  const f = 0.38 + arc * 0.62;                           // 0.38 → 1.0
  return col(r * f, g * f, b * f);
}

function renderFrame(getColor) {
  ART.forEach((line, li) => {
    const pride = PRIDE[li] ?? PRIDE[PRIDE.length - 1];
    let out = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      out += ch === ' ' ? ' ' : getColor(ch, i, line.length, pride)(ch);
    }
    wline(out);
  });
}

async function runSweep({ step = 3, fps = 55 } = {}) {
  const delay = Math.round(1000 / fps);
  for (let sx = -20; sx <= MAX_WIDTH + 20; sx += step) {
    up(ART.length);
    renderFrame((ch, i, _len, pride) => sheenColor(ch, Math.abs(i - sx), pride));
    await sleep(delay);
  }
}

async function renderStatic() {
  up(ART.length);
  renderFrame(staticColor);
}

/**
 * showIntro()              — full two-sweep entrance + subtitle (call ONCE at startup)
 * showIntro({ skip:true }) — no-op (used inside sub-commands called from hub)
 */
export async function showIntro({ skip = false } = {}) {
  if (skip) return;

  process.stdout.write('\n'.repeat(ART.length)); // reserve block

  await runSweep({ step: 3, fps: 55 }); // first sweep  (~0.8 s)
  await runSweep({ step: 3, fps: 55 }); // second sweep (~0.8 s)
  await renderStatic();                  // settle to metallic pride

  const silver = s => ansis.rgb(190, 190, 190)(s);
  process.stdout.write('\n');
  process.stdout.write(silver('Agent Skills for Claude Code by Pavithran Francis') + '\n\n');
  process.stdout.write(muted('Repository: ') + silver(REPO) + '\n\n');
}
