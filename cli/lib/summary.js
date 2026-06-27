import { brand, muted, success, warn, white, skillColor, divider } from './theme.js';
import { VERSION } from './constants.js';

const PACK = `claude-agent-skills v${VERSION}`;

function trunc(s, n) { return s.length <= n ? s : `${s.slice(0, n - 1)}…`; }

function colorStatus(label) {
  const padded = label.padEnd(10);
  if (label === 'ok' || label === 'synced')         return success(padded);
  if (label === 'installed' || label === 'updated')  return brand(padded);
  if (label === 'update')                            return brand(padded);
  if (label === 'skipped')                           return muted(padded);
  return warn(padded); // broken / missing / modified / removed / failed
}

// Pride-colored name with divider + white detail text
function skillRow(index, name, detail = '') {
  const colored = skillColor(index)(trunc(name, 30).padEnd(30));
  return detail ? `  ${colored}${divider}${white(detail)}` : `  ${colored}`;
}

function header({ scope, destination, lockPath }) {
  const lines = [
    `${brand('Pack')}:        ${PACK}`,
    `${brand('Scope')}:       ${scope}`,
    `${brand('Destination')}: ${destination}`,
  ];
  if (lockPath) lines.push(`${brand('Lockfile')}:    ${lockPath}`);
  return lines;
}

export function renderInstallSummary({ scope, skillsDir, lockPath, installed, updated, skipped }) {
  let idx = 0;
  const row = (entry, label) => {
    const name = typeof entry === 'string' ? entry : entry.name;
    const dep = typeof entry === 'object' && entry.dependencyOf ? `dep of ${entry.dependencyOf}` : '';
    return `  ${colorStatus(label)} ${skillColor(idx++)(trunc(name, 28).padEnd(28))}${dep ? divider + muted(dep) : ''}`;
  };
  const rows = [
    ...installed.map(e => row(e, 'installed')),
    ...updated.map(e =>   row(e, 'updated')),
    ...skipped.map(e =>   row(e, 'skipped')),
  ];
  return [
    ...header({ scope, destination: skillsDir, lockPath }),
    '',
    `Installed: ${installed.length}  Updated: ${updated.length}  Skipped: ${skipped.length}`,
    '',
    `${'STATUS'.padEnd(12)} NAME`,
    ...rows,
  ].join('\n');
}

export function renderSyncSummary({ scope, skillsDir, lockPath, synced, ok: upToDate }) {
  let idx = 0;
  const rows = [
    ...synced.map(n =>   `  ${colorStatus('synced')} ${skillRow(idx++, n)}`),
    ...upToDate.map(n => `  ${colorStatus('ok')}     ${skillRow(idx++, n)}`),
  ];
  return [
    ...header({ scope, destination: skillsDir, lockPath }),
    '',
    `Synced: ${synced.length}  Up to date: ${upToDate.length}`,
    '',
    `${'STATUS'.padEnd(12)} NAME`,
    ...rows,
  ].join('\n');
}

export function renderListSummary({ scope, skillsDir, lockPath, rows }) {
  const tableRows = rows.map((r, i) => {
    const label = r.healthy ? 'ok' : r.status;
    const name = skillColor(i)(trunc(r.name, 28).padEnd(28));
    return `  ${colorStatus(label)} ${name}${divider}${white(r.linkType.padEnd(8))}${muted(r.hash)}`;
  });
  return [
    ...header({ scope, destination: skillsDir, lockPath }),
    '',
    `${'STATUS'.padEnd(12)} ${'NAME'.padEnd(30)} ${'LINK'.padEnd(11)} HASH`,
    ...tableRows,
  ].join('\n');
}

export function renderCheckSummary({ scope, skillsDir, lockPath, rows, counts }) {
  const legend = { ok: 0, update: 0, modified: 0, missing: 0, broken: 0, ...counts };
  const tableRows = rows.map((r, i) => {
    const name = skillColor(i)(trunc(r.name, 28).padEnd(28));
    return `  ${colorStatus(r.status)} ${name}${divider}${white(r.linkType)}`;
  });
  return [
    ...header({ scope, destination: skillsDir, lockPath }),
    '',
    `ok: ${legend.ok}  update: ${legend.update}  modified: ${legend.modified}  missing: ${legend.missing}  broken: ${legend.broken}`,
    '',
    `${'STATUS'.padEnd(12)} ${'NAME'.padEnd(30)} LINK`,
    ...tableRows,
  ].join('\n');
}

export function renderUpdateSummary({ scope, skillsDir, lockPath, updated }) {
  return [
    ...header({ scope, destination: skillsDir, lockPath }),
    '',
    ...updated.map((n, i) => `  ${colorStatus('updated')} ${skillColor(i)(n)}`),
  ].join('\n');
}

export function renderRemoveSummary({ scope, skillsDir, lockPath, removed, failed }) {
  return [
    ...header({ scope, destination: skillsDir, lockPath }),
    '',
    ...removed.map((n, i) => `  ${colorStatus('removed')} ${skillColor(i)(n)}`),
    ...failed.map((f, i) => `  ${colorStatus('failed')}  ${skillColor(i)(f.name)}${divider}${warn(f.error)}`),
  ].join('\n');
}
