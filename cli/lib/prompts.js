import { select, multiselect, confirm, isCancel } from '@clack/prompts';
import ansis from 'ansis';
import { skillColor, white, muted, divider } from './theme.js';

export class CliCancel extends Error {}

// Escape/Ctrl+C at any prompt throws CliCancel — hub catches it silently and
// returns to the main menu (no "Cancelled." noise printed).
function guard(v) {
  if (isCancel(v)) throw new CliCancel();
  return v;
}

export async function pickScope(flags = {}) {
  if (flags.global) return { global: true };
  if (flags.project) return { project: true };
  const v = guard(await select({
    message: 'Select scope',
    options: [
      { value: 'global',  label: 'Global (~/.claude/skills + ~/.agents/skills)' },
      { value: 'project', label: 'Project (.claude/skills in current directory)' },
    ],
  }));
  return { global: v === 'global' };
}

export async function pickSkills(names, flags = {}, descriptions = {}) {
  if (flags.all) return names;
  if (flags.skill?.length) return flags.skill;

  // Calculate description width from actual terminal columns.
  // prefix=4 (clack's "□ "), nameCol=32, divider=3 (" │ ")
  const termWidth = process.stdout.columns || 100;
  const descWidth = Math.max(20, termWidth - 4 - 32 - 3);

  function fitDesc(s) {
    if (!s) return '';
    return s.length <= descWidth ? s : s.slice(0, descWidth - 1) + '…';
  }

  return guard(await multiselect({
    message: 'Select skills  (space to toggle, a for all, enter to confirm)',
    options: names.map((n, i) => {
      const name = skillColor(i)(ansis.bold(n.padEnd(32)));
      const desc = descriptions[n] ? white(fitDesc(descriptions[n])) : '';
      return { value: n, label: name + divider + desc };
    }),
    required: true,
  }));
}

export async function pickLinkType(flags = {}) {
  if (flags.copy) return 'copy';
  if (flags.symlink) return 'symlink';
  return guard(await select({
    message: 'Materialize skills as',
    options: [
      { value: 'copy',    label: 'Copy (safe for npx — recommended)' },
      { value: 'symlink', label: 'Symlink (requires a persistent global install)' },
    ],
    initialValue: 'copy',
  }));
}

export async function confirmProceed(message) {
  return guard(await confirm({ message, initialValue: true }));
}
