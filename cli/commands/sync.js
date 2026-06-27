import { note, outro } from '@clack/prompts';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { showIntro } from '../lib/banner.js';
import { readLock, writeLock, upsertSkill } from '../lib/lockfile.js';
import { resolveScope, ensureDirs } from '../lib/scope.js';
import { pickScope } from '../lib/prompts.js';
import { materialize, pathExists, isBroken, diskType } from '../lib/install.js';
import { hashSkill } from '../lib/hash.js';
import { renderSyncSummary } from '../lib/summary.js';

const BUNDLE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'bundled-skills');

export async function runSync(opts = {}) {
  await showIntro({ skip: opts.skipIntro });

  const scopeFlags = await pickScope(opts);
  const scope = resolveScope({ global: scopeFlags.global });
  const lock = await readLock(scope.lockPath);

  if (!lock || !Object.keys(lock.skills).length) {
    note(`No lockfile found at ${scope.lockPath}.\nRun "Add Skill(s)" first.`, 'Nothing to sync');
    outro('');
    return;
  }

  await ensureDirs(scope);
  const synced = [], ok = [];

  for (const [name, entry] of Object.entries(lock.skills).sort()) {
    const dest = join(scope.skillsDir, name);
    const src = join(BUNDLE_DIR, name);

    if (!existsSync(src)) {
      console.warn(`  Warning: "${name}" in lockfile but missing from bundle — skipping.`);
      ok.push(name);
      continue;
    }

    const ex = await pathExists(dest);
    const broken = ex && await isBroken(dest);
    const onDisk = await diskType(dest);
    const wantCopy = entry.linkType === 'copy';
    const typeMismatch = onDisk !== 'missing' &&
      ((wantCopy && onDisk === 'symlink') || (!wantCopy && onDisk === 'copy'));

    if (ex && !broken && !typeMismatch) { ok.push(name); continue; }

    const lt = await materialize({ src, dest, copy: wantCopy });
    if (scope.agentsSkillsDir) {
      await materialize({ src, dest: join(scope.agentsSkillsDir, name), copy: wantCopy });
    }
    upsertSkill(lock, name, { computedHash: await hashSkill(src), linkType: lt });
    synced.push(name);
  }

  await writeLock(scope.lockPath, lock);

  note(renderSyncSummary({
    scope: scope.scope, skillsDir: scope.skillsDir, lockPath: scope.lockPath,
    synced, ok,
  }), 'Sync summary');

  outro(synced.length > 0 ? `Synced ${synced.length} skill(s).` : 'All skills present.');
}
