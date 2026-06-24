#!/usr/bin/env node
import { existsSync, mkdirSync, cpSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const bundleDir = join(__dirname, '..', 'bundled-skills');
const EXCLUDE = new Set(['in-progress', 'deprecated', 'plugins']);

if (existsSync(bundleDir)) rmSync(bundleDir, { recursive: true });
mkdirSync(bundleDir, { recursive: true });

const bundled = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || EXCLUDE.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (existsSync(join(full, 'SKILL.md'))) {
      cpSync(full, join(bundleDir, entry.name), { recursive: true });
      bundled.push(entry.name);
      console.log(`  bundled: ${entry.name}`);
    } else {
      walk(full);
    }
  }
}

for (const bucket of ['skills', 'vendors']) {
  const base = join(repoRoot, bucket);
  if (existsSync(base)) walk(base);
}

// Read manually-maintained dependsOn map from repo root
const req = createRequire(import.meta.url);
const dependsOn = req(join(repoRoot, 'deps.json'));

// Generate cli/skills.json with current skill list + deps
const manifest = {
  schema_version: 1,
  name: 'claude-skills',
  version: req(join(__dirname, '..', 'package.json')).version,
  skills: bundled.sort(),
  dependsOn,
};
writeFileSync(join(__dirname, '..', 'skills.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nGenerated skills.json with ${bundled.length} skills.`);
