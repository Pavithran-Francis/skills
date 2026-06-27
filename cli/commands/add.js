import { note, outro } from '@clack/prompts';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { showIntro } from '../lib/banner.js';
import { hashSkill } from '../lib/hash.js';
import { readLock, writeLock, emptyLock, upsertSkill } from '../lib/lockfile.js';
import { materialize, pathExists } from '../lib/install.js';
import { resolveScope, ensureDirs } from '../lib/scope.js';
import { pickScope, pickSkills, pickLinkType, confirmProceed } from '../lib/prompts.js';
import { renderInstallSummary } from '../lib/summary.js';
import { loadManifest, expandDependencies } from '../lib/deps.js';

const BUNDLE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'bundled-skills');

function getBundled() {
  if (!existsSync(BUNDLE_DIR)) return [];
  return readdirSync(BUNDLE_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => ({ name: e.name, path: join(BUNDLE_DIR, e.name) }));
}

export async function runAdd(opts = {}) {
  await showIntro({ skip: opts.skipIntro });

  const bundled = getBundled();
  if (!bundled.length) {
    note('No bundled skills found. Run "npm run bundle" in cli/ first.', 'Error');
    outro('');
    return;
  }

  const scopeFlags = await pickScope(opts);
  const scope = resolveScope({ global: scopeFlags.global });
  await ensureDirs(scope);

  const manifest = loadManifest();
  const userSelected = await pickSkills(bundled.map(s => s.name), opts, manifest.descriptions ?? {});
  const { ordered, addedBy } = expandDependencies(manifest, userSelected);

  const linkType = await pickLinkType(opts);

  // Build install plan
  const lock = (await readLock(scope.lockPath)) ?? emptyLock();
  const installed = [], updated = [], skipped = [];

  const bundledMap = new Map(bundled.map(s => [s.name, s]));

  for (const name of ordered) {
    const skill = bundledMap.get(name);
    if (!skill) continue; // dep declared but not bundled — skip silently

    const hash = await hashSkill(skill.path);
    const existing = lock.skills[name];
    const dest = join(scope.skillsDir, name);
    const isDep = addedBy.has(name);

    if (existing?.computedHash === hash && await pathExists(dest)) {
      skipped.push({ name, isDep, dependencyOf: addedBy.get(name) });
    } else if (existing) {
      updated.push({ name, isDep, dependencyOf: addedBy.get(name) });
    } else {
      installed.push({ name, isDep, dependencyOf: addedBy.get(name) });
    }
  }

  const actionCount = installed.length + updated.length;
  if (actionCount === 0) {
    note('All selected skills (and their dependencies) are already up to date.', 'No changes');
    outro('Done.');
    return;
  }

  note(renderInstallSummary({
    scope: scope.scope, skillsDir: scope.skillsDir, lockPath: scope.lockPath,
    installed, updated, skipped,
  }), 'Installation summary');

  if (!opts.yes) {
    const proceed = await confirmProceed(`Install ${actionCount} skill(s)?`);
    if (!proceed) { outro('Cancelled. No changes made.'); return; }
  }

  // Apply
  for (const entry of [...installed, ...updated]) {
    const skill = bundledMap.get(entry.name);
    const hash = await hashSkill(skill.path);
    const lt = await materialize({ src: skill.path, dest: join(scope.skillsDir, entry.name), copy: linkType === 'copy' });
    if (scope.agentsSkillsDir) {
      await materialize({ src: skill.path, dest: join(scope.agentsSkillsDir, entry.name), copy: linkType === 'copy' });
    }
    upsertSkill(lock, entry.name, { computedHash: hash, linkType: lt });
  }
  await writeLock(scope.lockPath, lock);

  outro(`Done! ${actionCount} skill(s) installed. Restart Claude Code.`);
}
