import { brand, muted, success, warn } from './theme.js';
import { VERSION } from './constants.js';

const PACK = `claude-skills v${VERSION}`;

function trunc(s, n) { return s.length <= n ? s : `${s.slice(0, n - 1)}…`; }

// Pad before colouring so escape codes don't break column widths
function colorStatus(label, healthy) {
  const padded = label.padEnd(10);
  if (label === 'ok')      return success(padded);
  if (label === 'synced')  return success(padded);
  if (label === 'installed' || label === 'updated') return brand(padded);
  if (label === 'skipped') return muted(padded);
  return warn(padded); // broken / missing
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
  // Each entry is { name, dependencyOf? } or a plain string
  const row = (entry, label) => {
    const name = typeof entry === 'string' ? entry : entry.name;
    const dep = typeof entry === 'object' && entry.dependencyOf ? muted(` (dependency of ${entry.dependencyOf})`) : '';
    return `  ${colorStatus(label, label !== 'skipped')} ${name}${dep}`;
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
  const rows = [
    ...synced.map(n =>    `  ${colorStatus('synced', true)} ${trunc(n, 30).padEnd(30)} ${muted('—')}`),
    ...upToDate.map(n =>  `  ${colorStatus('ok', true)}     ${trunc(n, 30).padEnd(30)} ${muted('—')}`),
  ];
  return [
    ...header({ scope, destination: skillsDir, lockPath }),
    '',
    `Synced: ${synced.length}  Up to date: ${upToDate.length}`,
    '',
    `${'STATUS'.padEnd(12)} ${'NAME'.padEnd(30)} DEPS`,
    ...rows,
  ].join('\n');
}

export function renderListSummary({ scope, skillsDir, lockPath, rows }) {
  const tableRows = rows.map(r => {
    const label = r.healthy ? 'ok' : r.status;
    return `  ${colorStatus(label, r.healthy)} ${trunc(r.name, 30).padEnd(30)} ${r.linkType.padEnd(8)} ${r.hash}`;
  });
  return [
    ...header({ scope, destination: skillsDir, lockPath }),
    '',
    `${'STATUS'.padEnd(12)} ${'NAME'.padEnd(30)} ${'LINK'.padEnd(8)} HASH`,
    ...tableRows,
  ].join('\n');
}
