import { note, outro } from '@clack/prompts';
import { join } from 'node:path';
import { showIntro } from '../lib/banner.js';
import { readLock } from '../lib/lockfile.js';
import { resolveScope } from '../lib/scope.js';
import { pickScope } from '../lib/prompts.js';
import { pathExists, isBroken } from '../lib/install.js';
import { renderListSummary } from '../lib/summary.js';

export async function runList(opts = {}) {
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
      const ex = await pathExists(dest);
      const broken = ex && await isBroken(dest);
      const status = ex && !broken ? 'ok' : broken ? 'broken' : 'missing';
      return { name, linkType: entry.linkType, hash: entry.computedHash.slice(0, 8), status, healthy: status === 'ok' };
    }),
  );

  note(renderListSummary({
    scope: scope.scope, skillsDir: scope.skillsDir, lockPath: scope.lockPath, rows,
  }), 'Installed skills');
  outro('');
}
