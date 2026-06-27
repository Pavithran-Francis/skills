import { note, outro } from '@clack/prompts';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { showIntro } from '../lib/banner.js';
import { readLock } from '../lib/lockfile.js';
import { resolveScope } from '../lib/scope.js';
import { pickScope } from '../lib/prompts.js';
import { pathExists, isBroken } from '../lib/install.js';
import { hashSkill } from '../lib/hash.js';
import { renderCheckSummary } from '../lib/summary.js';

const BUNDLE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'bundled-skills');

export async function runCheck(opts = {}) {
  await showIntro({ skip: opts.skipIntro });

  const scopeFlags = await pickScope(opts);
  const scope = resolveScope({ global: scopeFlags.global });
  const lock = await readLock(scope.lockPath);

  if (!lock || !Object.keys(lock.skills).length) {
    console.log(`No skills installed. Lockfile not found at: ${scope.lockPath}`);
    outro('');
    return;
  }

  const rows = await Promise.all(
    Object.entries(lock.skills).sort().map(async ([name, entry]) => {
      const dest = join(scope.skillsDir, name);
      const bundledPath = join(BUNDLE_DIR, name);

      const exists = await pathExists(dest);
      if (!exists) return { name, status: 'missing', linkType: entry.linkType };

      const broken = await isBroken(dest);
      if (broken) return { name, status: 'broken', linkType: entry.linkType };

      const diskHash = await hashSkill(dest);
      if (diskHash !== entry.computedHash) return { name, status: 'modified', linkType: entry.linkType };

      if (existsSync(bundledPath)) {
        const bundledHash = await hashSkill(bundledPath);
        if (bundledHash !== entry.computedHash) return { name, status: 'update', linkType: entry.linkType };
      }

      return { name, status: 'ok', linkType: entry.linkType };
    }),
  );

  const counts = rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; }, {});
  note(renderCheckSummary({ scope: scope.scope, skillsDir: scope.skillsDir, lockPath: scope.lockPath, rows, counts }), 'Skill health check');
  outro('');
}
