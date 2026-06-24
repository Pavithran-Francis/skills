import { cp, lstat, rm, symlink } from 'node:fs/promises';
import path from 'node:path';

export async function materialize({ src, dest, copy }) {
  await rm(dest, { recursive: true, force: true });
  if (copy) {
    await cp(path.resolve(src), dest, { recursive: true });
    return 'copy';
  }
  const type = process.platform === 'win32' ? 'junction' : 'dir';
  await symlink(path.resolve(src), dest, type);
  return 'symlink';
}

export async function pathExists(p) {
  try { await lstat(p); return true; } catch { return false; }
}

export async function isBroken(p) {
  try {
    const st = await lstat(p);
    if (!st.isSymbolicLink()) return false;
    await (await import('node:fs/promises')).access(p);
    return false;
  } catch { return true; }
}

export async function diskType(p) {
  try { return (await lstat(p)).isSymbolicLink() ? 'symlink' : 'copy'; }
  catch { return 'missing'; }
}
