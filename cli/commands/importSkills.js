import { note, outro } from '@clack/prompts';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { showIntro } from '../lib/banner.js';
import { readLock, writeLock, upsertSkill } from '../lib/lockfile.js';
import { resolveScope, ensureDirs } from '../lib/scope.js';
import { pickScope, confirmProceed } from '../lib/prompts.js';
import { materialize } from '../lib/install.js';
import { hashSkill } from '../lib/hash.js';

const BUNDLE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'bundled-skills');

export async function runImport(opts = {}) {
  await showIntro({ skip: opts.skipIntro ?? true });

  const file = opts.file;
  if (!file) {
    console.error('Specify a file: claude-agent-skills import --file <lockfile.json>');
    return;
  }

  let imported;
  try {
    imported = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`Could not read ${file}: ${e.message}`);
    return;
  }

  const skills = Object.keys(imported.skills ?? {});
  if (!skills.length) {
    note('No skills found in the imported lockfile.', 'Empty');
    outro('');
    return;
  }

  const scopeFlags = await pickScope(opts);
  const scope = resolveScope({ global: scopeFlags.global });

  note(`${skills.length} skill(s) from ${file}:\n${skills.join(', ')}`, 'Ready to import');

  const proceed = await confirmProceed(`Install ${skills.length} skill(s)?`);
  if (!proceed) { outro('Cancelled. No changes made.'); return; }

  await ensureDirs(scope);
  const lock = (await readLock(scope.lockPath)) ?? { version: 1, skills: {} };
  const installed = [], skipped = [];

  for (const name of skills.sort()) {
    const src = join(BUNDLE_DIR, name);
    if (!existsSync(src)) { skipped.push(name); continue; }

    const entry = imported.skills[name];
    const copy = entry?.linkType !== 'symlink';
    await materialize({ src, dest: join(scope.skillsDir, name), copy });
    if (scope.agentsSkillsDir) {
      await materialize({ src, dest: join(scope.agentsSkillsDir, name), copy });
    }
    upsertSkill(lock, name, { computedHash: await hashSkill(src), linkType: copy ? 'copy' : 'symlink' });
    installed.push(name);
  }

  await writeLock(scope.lockPath, lock);

  if (skipped.length) note(`Skipped (not in bundle): ${skipped.join(', ')}`, 'Warning');
  outro(`Imported ${installed.length} skill(s). Restart Claude Code.`);
}
