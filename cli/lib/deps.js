import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const req = createRequire(import.meta.url);

export function loadManifest() {
  const manifestPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills.json');
  try {
    return req(manifestPath);
  } catch {
    return { skills: [], dependsOn: {} };
  }
}

/**
 * Topological expansion: given selected skill names, resolves all transitive
 * dependencies and returns them in install order (deps before dependents).
 * Returns { ordered, addedBy } where addedBy maps auto-added names → who pulled them in.
 */
export function expandDependencies(manifest, selected) {
  const known = new Set(manifest.skills ?? []);
  const selectedSet = new Set(selected);
  const addedBy = new Map();
  const visiting = new Set();
  const visited = new Set();
  const ordered = [];

  function visit(name, parent) {
    if (visited.has(name)) return;
    if (visiting.has(name)) throw new Error(`Circular skill dependency involving: ${name}`);
    visiting.add(name);

    for (const dep of (manifest.dependsOn ?? {})[name] ?? []) {
      if (!selectedSet.has(dep) && !addedBy.has(dep)) {
        addedBy.set(dep, name);
      }
      visit(dep, name);
    }

    visiting.delete(name);
    visited.add(name);
    ordered.push(name);
  }

  for (const name of selected) {
    visit(name, null);
  }

  return { ordered, addedBy };
}
