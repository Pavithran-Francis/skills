import { mkdir, open, readFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { VERSION } from './constants.js';

export async function readLock(lockPath) {
  try { return JSON.parse(await readFile(lockPath, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return null; throw e; }
}

export async function writeLock(lockPath, lock) {
  const out = { ...lock, skills: Object.fromEntries(Object.entries(lock.skills).sort()) };
  const content = `${JSON.stringify(out, null, 2)}\n`;
  const dir = path.dirname(lockPath);
  const tmp = path.join(dir, `.claude-skills-${process.pid}-${randomBytes(4).toString('hex')}.tmp`);

  await mkdir(dir, { recursive: true });
  const fh = await open(tmp, 'wx');
  try { await fh.writeFile(content, 'utf8'); await fh.sync(); } finally { await fh.close(); }
  await rename(tmp, lockPath);
}

export function emptyLock() {
  return { version: 1, package: { name: 'claude-skills', version: VERSION }, skills: {} };
}

export function upsertSkill(lock, name, entry) {
  const now = new Date().toISOString();
  const existing = lock.skills[name];
  lock.skills[name] = { ...entry, installedAt: existing?.installedAt ?? now, updatedAt: now };
}

export function removeSkill(lock, name) {
  if (!lock.skills[name]) return false;
  delete lock.skills[name];
  return true;
}
