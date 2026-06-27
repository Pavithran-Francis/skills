import { multiselect, note, outro, isCancel, cancel } from '@clack/prompts';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { showIntro } from '../lib/banner.js';
import { readLock, writeLock, removeSkill } from '../lib/lockfile.js';
import { resolveScope } from '../lib/scope.js';
import { pickScope, confirmProceed } from '../lib/prompts.js';
import { pathExists } from '../lib/install.js';
import { renderRemoveSummary } from '../lib/summary.js';

export async function runRemove(opts = {}) {
  await showIntro({ skip: opts.skipIntro });

  const scopeFlags = await pickScope(opts);
  const scope = resolveScope({ global: scopeFlags.global });
  const lock = await readLock(scope.lockPath);

  if (!lock || !Object.keys(lock.skills).length) {
    console.log(`No skills installed. Lockfile not found at: ${scope.lockPath}`);
    outro('');
    return;
  }

  const installed = Object.keys(lock.skills).sort();

  const selected = await multiselect({
    message: 'Select skills to remove:',
    options: installed.map(n => ({ value: n, label: n })),
    required: false,
  });

  if (isCancel(selected)) { cancel('Cancelled.'); return; }
  if (!selected?.length) { outro('Nothing selected.'); return; }

  if (!opts.yes) {
    const proceed = await confirmProceed(`Remove ${selected.length} skill(s)?`);
    if (!proceed) { outro('Cancelled. No changes made.'); return; }
  }

  const removed = [], failed = [];
  for (const name of selected) {
    try {
      const dest = join(scope.skillsDir, name);
      if (await pathExists(dest)) await rm(dest, { recursive: true, force: true });
      if (scope.agentsSkillsDir) {
        const agentDest = join(scope.agentsSkillsDir, name);
        if (await pathExists(agentDest)) await rm(agentDest, { recursive: true, force: true });
      }
      removeSkill(lock, name);
      removed.push(name);
    } catch (e) {
      failed.push({ name, error: e.message });
    }
  }
  await writeLock(scope.lockPath, lock);

  note(renderRemoveSummary({ scope: scope.scope, skillsDir: scope.skillsDir, lockPath: scope.lockPath, removed, failed }), 'Removed');
  outro(removed.length > 0 ? `Removed ${removed.length} skill(s). Restart Claude Code.` : 'Nothing removed.');
}
