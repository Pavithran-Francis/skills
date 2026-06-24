import { mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export function resolveScope({ global: isGlobal, cwd = process.cwd() } = {}) {
  const base = isGlobal ? os.homedir() : path.resolve(cwd);
  const configDir = path.join(base, '.claude');
  return {
    scope: isGlobal ? 'global' : 'project',
    skillsDir: path.join(configDir, 'skills'),
    agentsSkillsDir: isGlobal ? path.join(os.homedir(), '.agents', 'skills') : null,
    lockPath: path.join(configDir, 'claude-skills-lock.json'),
  };
}

export async function ensureDirs({ skillsDir, agentsSkillsDir }) {
  await mkdir(skillsDir, { recursive: true });
  if (agentsSkillsDir) await mkdir(agentsSkillsDir, { recursive: true });
}
