import updateNotifier from 'update-notifier';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import ansis from 'ansis';
import { showIntro } from '../lib/banner.js';
import { CliCancel } from '../lib/prompts.js';
import { brand, muted, white } from '../lib/theme.js';
import { inlineSelect } from '../lib/inlineSelect.js';

const req = createRequire(import.meta.url);
const pkg = req(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'));
updateNotifier({ pkg }).notify();

import { runAdd }    from './add.js';
import { runUpdate } from './update.js';
import { runRemove } from './remove.js';
import { runList }   from './list.js';
import { runSync }   from './sync.js';
import { runCheck }  from './check.js';

const SKIP = { skipIntro: true };

const MENU = [
  { value: 'add',    label: 'Add Skill(s)',               hint: 'install new skills' },
  { value: 'update', label: 'Update Existing Skill(s)',   hint: 'pull latest versions' },
  { value: 'remove', label: 'Remove Existing Skill(s)',   hint: 'uninstall skills' },
  { value: 'list',   label: 'List Installed Skill(s)',    hint: 'show what\'s installed' },
  { value: 'sync',   label: 'Sync/Restore from Lockfile', hint: 'restore from claude-skills-lock.json' },
  { value: 'check',  label: 'Check Skill(s)',             hint: 'verify hashes & lockfile' },
  { value: 'quit',   label: 'Quit' },
];

function printCompactHeader() {
  const silver = s => ansis.rgb(190, 190, 190)(s);
  process.stdout.write('\n');
  process.stdout.write(brand('◈ CLAUDE SKILLS') + '  ' + silver('Agent Skills for Claude Code') + '\n');
  process.stdout.write('\n');
}

export async function runHub() {
  await showIntro();

  let first = true;
  for (;;) {
    if (!first) {
      // Clear entire screen and show compact header instead of re-running the banner
      process.stdout.write('\x1b[2J\x1b[H');
      printCompactHeader();
    }
    first = false;

    try {
      const choice = await inlineSelect({
        message: 'What do you want to do?',
        hint: '↑↓ navigate · enter select · esc quit',
        options: MENU,
      });

      if (choice === 'quit') {
        process.stdout.write('\n' + muted('Goodbye.') + '\n');
        return;
      }

      if (choice === 'add')    await runAdd(SKIP);
      if (choice === 'update') await runUpdate(SKIP);
      if (choice === 'remove') await runRemove(SKIP);
      if (choice === 'list')   await runList(SKIP);
      if (choice === 'sync')   await runSync(SKIP);
      if (choice === 'check')  await runCheck(SKIP);
    } catch (e) {
      if (e instanceof CliCancel) continue; // sub-command ESC → back to menu
      if (e?.isCancel) {                    // hub menu ESC → quit
        process.stdout.write('\n' + muted('Goodbye.') + '\n');
        return;
      }
      throw e;
    }
  }
}
