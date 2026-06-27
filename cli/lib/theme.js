import ansis from 'ansis';

export const BRAND_HEX = '#FF69B4'; // hot pink

const ok = () => !process.env.NO_COLOR && ansis.isSupported();

export const brand   = t => ok() ? ansis.hex(BRAND_HEX)(t) : t;
export const success = t => ok() ? ansis.green(t) : t;
export const warn    = t => ok() ? ansis.yellow(t) : t;
export const muted   = t => ok() ? ansis.dim(t) : t;
export const white   = t => ok() ? ansis.white(t) : t;
export const strip   = t => ansis.strip(t);

// ── Pride mode ─────────────────────────────────────────────────────────────
// Set to false after June to revert skill names to brand pink.
export const PRIDE_MODE = true;

const PRIDE_PALETTE = [
  [220,  30,  30],   // red
  [255, 140,   0],   // orange
  [220, 200,   0],   // yellow
  [ 30, 185,  30],   // green
  [ 30, 100, 255],   // blue
  [150,  30, 230],   // purple
];

// Returns a color function for the nth skill. Cycles through pride palette in
// PRIDE_MODE, falls back to brand pink otherwise.
export function skillColor(index) {
  if (!ok()) return t => t;
  if (!PRIDE_MODE) return brand;
  const [r, g, b] = PRIDE_PALETTE[index % PRIDE_PALETTE.length];
  return t => ansis.rgb(r, g, b)(t);
}

export const divider = ok() ? ansis.dim(' │ ') : ' | ';
