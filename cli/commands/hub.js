import { select, isCancel, cancel, outro } from '@clack/prompts';
import { showIntro } from '../lib/banner.js';
import { CliCancel } from '../lib/prompts.js';
import { runAdd } from './add.js';
import { runUpdate } from './update.js';
import { runRemove } from './remove.js';
import { runList } from './list.js';
import { runSync } from './sync.js';
import { runCheck } from './check.js';

const SKIP = { skipIntro: true };

const MENU = [
  { value: 'add',    label: 'Add Skill(s)' },
  { value: 'update', label: 'Update Existing Skill(s)' },
  { value: 'remove', label: 'Remove Existing Skill(s)' },
  { value: 'list',   label: 'List Installed Skill(s)' },
  { value: 'sync',   label: 'Sync/Restore Skills from Lockfile' },
  { value: 'check',  label: 'Check Skill(s)' },
  { value: 'quit',   label: 'Quit' },
];

export async function runHub() {
  await showIntro();

  for (;;) {
    const choice = await select({ message: 'What do you want to do?', options: MENU });

    if (isCancel(choice)) { cancel('Cancelled.'); return; }
    if (choice === 'quit') { outro('Goodbye.'); return; }

    try {
      if (choice === 'add')    await runAdd(SKIP);
      if (choice === 'update') await runUpdate(SKIP);
      if (choice === 'remove') await runRemove(SKIP);
      if (choice === 'list')   await runList(SKIP);
      if (choice === 'sync')   await runSync(SKIP);
      if (choice === 'check')  await runCheck(SKIP);
    } catch (e) {
      if (e instanceof CliCancel) continue;
      throw e;
    }
  }
}
