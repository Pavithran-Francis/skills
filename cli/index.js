#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runHub } from './commands/hub.js';
import { runAdd } from './commands/add.js';
import { runUpdate } from './commands/update.js';
import { runRemove } from './commands/remove.js';
import { runList } from './commands/list.js';
import { runSync } from './commands/sync.js';
import { runCheck } from './commands/check.js';
import { runExport } from './commands/exportSkills.js';
import { runImport } from './commands/importSkills.js';
import { CliCancel } from './lib/prompts.js';

const req = createRequire(import.meta.url);
const { version } = req(join(dirname(fileURLToPath(import.meta.url)), 'package.json'));

const program = new Command()
  .name('claude-skills')
  .description("Install and manage Pavi's Claude Code skills")
  .version(version);

program
  .command('hub', { isDefault: true })
  .description('Interactive menu (default) — loops until Quit or Ctrl+C')
  .action(() => runHub());

program
  .command('add')
  .description('Install skills')
  .option('-g, --global', 'Install globally (~/.claude/skills)')
  .option('-p, --project', 'Install to current project (.claude/skills)')
  .option('--all', 'Install all skills without prompting')
  .option('--skill <name...>', 'Specific skill(s) to install')
  .option('--copy', 'Copy files (safe for npx)')
  .option('--symlink', 'Create symlinks (persistent install only)')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(opts => runAdd(opts));

program
  .command('update')
  .description('Update installed skills to latest bundled version')
  .option('-g, --global', 'Update global skills')
  .option('-p, --project', 'Update project skills')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(opts => runUpdate(opts));

program
  .command('remove')
  .description('Remove installed skills')
  .option('-g, --global', 'Remove from global')
  .option('-p, --project', 'Remove from project')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(opts => runRemove(opts));

program
  .command('list')
  .description('List installed skills and their health status')
  .option('-g, --global', 'List global skills')
  .option('-p, --project', 'List project skills')
  .action(opts => runList(opts));

program
  .command('sync')
  .description('Restore skills from lockfile')
  .option('-g, --global', 'Sync global skills')
  .option('-p, --project', 'Sync project skills')
  .action(opts => runSync(opts));

program
  .command('check')
  .description('Check health and update status of installed skills')
  .option('-g, --global', 'Check global skills')
  .option('-p, --project', 'Check project skills')
  .action(opts => runCheck(opts));

program
  .command('export')
  .description('Export lockfile for sharing with teammates')
  .option('-g, --global', 'Export global lockfile')
  .option('-p, --project', 'Export project lockfile')
  .option('--file <path>', 'Write to file instead of stdout')
  .action(opts => runExport(opts));

program
  .command('import')
  .description('Import a shared lockfile and install those skills')
  .option('-g, --global', 'Install into global scope')
  .option('-p, --project', 'Install into project scope')
  .option('--file <path>', 'Lockfile to import (required)')
  .option('-y, --yes', 'Skip confirmation')
  .action(opts => runImport(opts));

program.parseAsync().catch(err => {
  if (err instanceof CliCancel) process.exit(0);
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
