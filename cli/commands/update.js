import { multiselect, note, outro, isCancel } from '@clack/prompts';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { showIntro } from '../lib/banner.js';
import { readLock, writeLock, upsertSkill } from '../lib/lockfile.js';
import { resolveScope, ensureDirs } from '../lib/scope.js';
import { pickScope, confirmProceed, CliCancel } from '../lib/prompts.js';
import { materialize } from '../lib/install.js';
import { hashSkill } from '../lib/hash.js';
import { renderUpdateSummary } from '../lib/summary.js';

const BUNDLE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'bundled-skills');

export async function runUpdate(opts = {}) {
  await showIntro({ skip: opts.skipIntro });

  const scopeFlags = await pickScope(opts);
  const scope = resolveScope({ global: scopeFlags.global });
  const lock = await readLock(scope.lockPath);

  if (!lock || !Object.keys(lock.skills).length) {
    console.log(`No skills installed. Run "add" first.`);
    outro('');
    return;
  }

  const updatable = [];
  for (const [name, entry] of Object.entries(lock.skills).sort()) {
    const bundledPath = join(BUNDLE_DIR, name);
    if (!existsSync(bundledPath)) continue;
    const bundledHash = await hashSkill(bundledPath);
    if (bundledHash !== entry.computedHash) updatable.push({ name, bundledPath, linkType: entry.linkType });
  }

  if (!updatable.length) {
    note('All installed skills are already up to date.', 'No updates available');
    outro('Done.');
    return;
  }

  const selected = await multiselect({
    message: `Select skills to update (${updatable.length} available):`,
    options: updatable.map(s => ({ value: s.name, label: s.name })),
    required: false,
  });

  if (isCancel(selected)) throw new CliCancel();
  if (!selected?.length) { outro('Nothing selected.'); return; }

  if (!opts.yes) {
    const proceed = await confirmProceed(`Update ${selected.length} skill(s)?`);
    if (!proceed) { outro('Cancelled. No changes made.'); return; }
  }

  await ensureDirs(scope);
  for (const name of selected) {
    const skill = updatable.find(s => s.name === name);
    const hash = await hashSkill(skill.bundledPath);
    const lt = await materialize({ src: skill.bundledPath, dest: join(scope.skillsDir, name), copy: skill.linkType === 'copy' });
    if (scope.agentsSkillsDir) {
      await materialize({ src: skill.bundledPath, dest: join(scope.agentsSkillsDir, name), copy: skill.linkType === 'copy' });
    }
    upsertSkill(lock, name, { computedHash: hash, linkType: lt });
  }
  await writeLock(scope.lockPath, lock);

  note(renderUpdateSummary({ scope: scope.scope, skillsDir: scope.skillsDir, lockPath: scope.lockPath, updated: selected }), 'Updated');
  outro(`Done! ${selected.length} skill(s) updated. Restart Claude Code.`);
}
