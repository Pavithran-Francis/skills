import { note, outro } from '@clack/prompts';
import { writeFileSync } from 'node:fs';
import { showIntro } from '../lib/banner.js';
import { readLock } from '../lib/lockfile.js';
import { resolveScope } from '../lib/scope.js';
import { pickScope } from '../lib/prompts.js';

export async function runExport(opts = {}) {
  await showIntro({ skip: opts.skipIntro ?? true });

  const scopeFlags = await pickScope(opts);
  const scope = resolveScope({ global: scopeFlags.global });
  const lock = await readLock(scope.lockPath);

  if (!lock || !Object.keys(lock.skills).length) {
    note(`No skills installed at ${scope.lockPath}.`, 'Nothing to export');
    outro('');
    return;
  }

  const json = `${JSON.stringify(lock, null, 2)}\n`;

  if (opts.file) {
    writeFileSync(opts.file, json, 'utf8');
    note(`Wrote ${Object.keys(lock.skills).length} skill(s) to ${opts.file}\nShare this file with teammates and have them run:\n  claude-agent-skills import --file ${opts.file}`, 'Exported');
    outro('Done.');
  } else {
    process.stdout.write(json);
  }
}
