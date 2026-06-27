import ansis from 'ansis';

// ── Colour mode ─────────────────────────────────────────────────────────────
// Flip PRIDE_MODE to true for pride month to restore rainbow palette.
export const PRIDE_MODE = false;

export const BRAND_HEX = '#B91919'; // metallic crimson

const ok = () => !process.env.NO_COLOR && ansis.isSupported();

export const brand   = t => ok() ? ansis.hex(BRAND_HEX)(t) : t;
export const success = t => ok() ? ansis.green(t) : t;
export const warn    = t => ok() ? ansis.yellow(t) : t;
export const muted   = t => ok() ? ansis.dim(t) : t;
export const white   = t => ok() ? ansis.white(t) : t;
export const strip   = t => ansis.strip(t);

// Single consistent crimson — all skills the same colour
const CRIMSON = [[200, 35, 35]];

// Pride rainbow — restore for pride month
const PRIDE_PALETTE = [
  [220,  30,  30],
  [255, 140,   0],
  [220, 200,   0],
  [ 30, 185,  30],
  [ 30, 100, 255],
  [150,  30, 230],
];

export function skillColor(index) {
  if (!ok()) return t => t;
  const palette = PRIDE_MODE ? PRIDE_PALETTE : CRIMSON;
  const [r, g, b] = palette[index % palette.length];
  return t => ansis.rgb(r, g, b)(t);
}

export const divider = ok() ? ansis.dim(' │ ') : ' | ';
