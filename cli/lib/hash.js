import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SKIP = new Set(['.git', 'node_modules']);

async function collect(dir, base) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) files.push(...await collect(full, base));
    } else if (e.isFile()) {
      const rel = path.relative(base, full).split(path.sep).join('/');
      files.push({ rel, content: await readFile(full) });
    }
  }
  return files;
}

export async function hashSkill(dir) {
  const files = (await collect(dir, dir)).sort((a, b) => a.rel.localeCompare(b.rel));
  const h = createHash('sha256');
  for (const f of files) { h.update(f.rel); h.update(f.content); }
  return h.digest('hex');
}
