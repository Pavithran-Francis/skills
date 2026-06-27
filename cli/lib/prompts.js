import { confirm, isCancel } from '@clack/prompts';
import ansis from 'ansis';
import { skillColor, white, muted, divider } from './theme.js';
import { skillPicker } from './picker.js';
import { inlineSelect } from './inlineSelect.js';

export class CliCancel extends Error {}

function guard(v) {
  if (isCancel(v)) throw new CliCancel();
  return v;
}

export async function pickScope(flags = {}) {
  if (flags.global) return { global: true };
  if (flags.project) return { project: true };
  const v = await inlineSelect({
    message: 'Select scope',
    hint: '↑↓ navigate · enter select · esc back',
    options: [
      { value: 'global',  label: 'Global',  hint: '~/.claude/skills + ~/.agents/skills' },
      { value: 'project', label: 'Project', hint: '.claude/skills in current directory' },
    ],
  }).catch(e => { if (e?.isCancel) throw new CliCancel(); throw e; });
  return { global: v === 'global' };
}

export async function pickSkills(names, flags = {}, descriptions = {}) {
  if (flags.all) return names;
  if (flags.skill?.length) return flags.skill;

  try {
    const result = await skillPicker({
      message: 'Select skills',
      options: names.map(n => ({ value: n, label: n, description: descriptions[n] || '' })),
    });
    if (result === null) throw new CliCancel();
    return result;
  } catch (e) {
    if (e?.isCancel) throw new CliCancel();
    throw e;
  }
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
