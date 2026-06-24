import { select, isCancel, cancel, outro } from '@clack/prompts';
import { showIntro } from '../lib/banner.js';
import { CliCancel } from '../lib/prompts.js';
import { runAdd } from './add.js';
import { runList } from './list.js';
import { runSync } from './sync.js';

const SKIP_INTRO = { skipIntro: true };

const MENU = [
  { value: 'add',  label: 'Install Skills' },
  { value: 'list', label: 'List Installed Skills' },
  { value: 'sync', label: 'Sync/Restore Skills from Lockfile' },
  { value: 'quit', label: 'Quit' },
];

export async function runHub() {
  // Banner shows ONCE — menu loops below it without reprinting
  await showIntro();

  for (;;) {
    const choice = await select({
      message: 'What do you want to do?',
      options: MENU,
    });

    if (isCancel(choice)) { cancel('Cancelled.'); return; }
    if (choice === 'quit') { outro('Goodbye.'); return; }

    try {
      if (choice === 'add')  await runAdd(SKIP_INTRO);
      if (choice === 'list') await runList(SKIP_INTRO);
      if (choice === 'sync') await runSync(SKIP_INTRO);
    } catch (e) {
      if (e instanceof CliCancel) continue;
      throw e;
    }
    // Loop back to the menu — no banner reprint
  }
}
