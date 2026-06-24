import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const req = createRequire(import.meta.url);
const pkg = req(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'));

export const VERSION = pkg.version;
export const PACKAGE_NAME = pkg.name;
export const REPO = 'https://github.com/Pavithran-Francis/skills';
