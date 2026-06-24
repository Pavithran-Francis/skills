import ansis from 'ansis';

export const BRAND_HEX = '#FF69B4'; // hot pink

const ok = () => !process.env.NO_COLOR && ansis.isSupported();

export const brand   = t => ok() ? ansis.hex(BRAND_HEX)(t) : t;
export const success = t => ok() ? ansis.green(t) : t;
export const warn    = t => ok() ? ansis.yellow(t) : t;
export const muted   = t => ok() ? ansis.dim(t) : t;
export const strip   = t => ansis.strip(t);
