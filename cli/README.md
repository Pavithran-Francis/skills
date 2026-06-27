# claude-agent-skills

Interactive CLI to install and manage Claude Code agent skills — the prompt files that teach Claude how to perform specialised tasks in your projects.

## Quick start

```bash
npx claude-agent-skills
```

Or install globally for a persistent command:

```bash
npm install -g claude-agent-skills
claude-agent-skills
```

## What it does

Launches a full-screen interactive TUI (alternate screen buffer — your terminal is restored on exit) with an animated banner, grid-based skill picker, and in-place navigation. Works like `vim` or `less` — nothing leaks into your scrollback.

Skills are installed into:

| Scope   | Paths |
|---------|-------|
| Global  | `~/.claude/skills/` + `~/.agents/skills/` |
| Project | `.claude/skills/` in the current directory |

A lockfile (`claude-skills-lock.json`) tracks every installed skill with a SHA-256 hash so updates, drift, and broken symlinks can be detected.

## Navigation

Every screen shows a `►► key action` hint bar at the bottom.

| Key | Action |
|-----|--------|
| `↑` `↓` | Move up / down in menus |
| `←` `→` | Move left / right in skill grid |
| `space` | Toggle skill selection |
| `a` | Select / deselect all skills |
| `enter` | Confirm |
| `esc` | Go back to previous menu |
| `ctrl+c` | Quit |

After any command finishes, a **5-second countdown** is shown (`◂ returning to menu in 5s · press any key`) so you can read the output before the screen resets. Press any key to skip the wait.

## Menu options

| Option | What it does |
|--------|--------------|
| **Add Skill(s)** | Grid picker of all 54 bundled skills. Select scope → pick skills → pick link type → confirm. Dependencies resolved automatically. |
| **Update Existing Skill(s)** | Finds skills where the bundled version has a newer hash and re-installs them. |
| **Remove Existing Skill(s)** | Uninstalls selected skills from disk and removes them from the lockfile. |
| **List Installed Skill(s)** | Table of all installed skills with their status, link type, and hash. |
| **Sync/Restore from Lockfile** | Re-materializes any missing or broken skills using the lockfile. Run this after cloning a new machine or if symlinks break. |
| **Check Skill(s)** | Health check — reports each skill as `ok`, `update available`, `locally modified`, `missing`, or `broken symlink`. |
| **Quit** | Restore the terminal and exit. |

## CLI subcommands

All menu actions are also available as direct subcommands (no TUI):

```bash
claude-agent-skills add --global --all              # install all skills globally
claude-agent-skills add --skill grilling tdd        # install specific skills
claude-agent-skills add --project --copy            # copy into project scope
claude-agent-skills update --global                 # update all globally
claude-agent-skills remove --project                # interactive remove, project scope
claude-agent-skills list --global                   # show installed skills
claude-agent-skills sync --global                   # restore from lockfile
claude-agent-skills check --project                 # health check, project scope
claude-agent-skills export --out skills.lock.json   # export lockfile for team sharing
claude-agent-skills import --in skills.lock.json    # import and apply a shared lockfile
```

### Flags

| Flag | Description |
|------|-------------|
| `--global` | Target `~/.claude/skills/` (default) |
| `--project` | Target `.claude/skills/` in cwd |
| `--all` | Select all available skills |
| `--skill <name...>` | Specify skill names directly |
| `--copy` | Materialize as file copies (safe for npx) |
| `--symlink` | Materialize as symlinks (requires persistent install) |
| `--yes` | Skip confirmation prompts |
| `--out <path>` | Export lockfile destination |
| `--in <path>` | Import lockfile source |

## Lockfile

The lockfile (`claude-skills-lock.json`) records each installed skill's SHA-256 hash and link type. Commit it to your repo to let teammates restore the exact same skill set with:

```bash
claude-agent-skills import --in claude-skills-lock.json --global
```

Export your current setup:

```bash
claude-agent-skills export --out claude-skills-lock.json
```

## Included skills

54 skills across four upstream sources:

| Source | Skills |
|--------|--------|
| [mattpocock/skills](https://github.com/mattpocock/skills) | `brainstorming`, `codebase-design`, `diagnosing-bugs`, `dispatching-parallel-agents`, `domain-modeling`, `executing-plans`, `finishing-a-development-branch`, `implement`, `improve-codebase-architecture`, `prototype`, `receiving-code-review`, `requesting-code-review`, `subagent-driven-development`, `systematic-debugging`, `tdd`, `teach`, `test-driven-development`, `to-issues`, `to-prd`, `triage`, `using-git-worktrees`, `using-superpowers`, `verification-before-completion`, `writing-plans`, `writing-skills` |
| [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | `caveman`, `cavecrew`, `caveman-commit`, `caveman-compress`, `caveman-help`, `caveman-review`, `caveman-stats` |
| [obra/superpowers](https://github.com/obra/superpowers) | `git-guardrails-claude-code`, `migrate-to-shoehorn`, `resolving-merge-conflicts`, `scaffold-exercises`, `setup-matt-pocock-skills`, `setup-pre-commit` |
| Personal (Pavi) | `ask-matt`, `council`, `edit-article`, `grill-me`, `grill-with-docs`, `grilling`, `handoff`, `i-am-dumb`, `obsidian-vault`, `ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review`, `writing-great-skills` |

## How bundling works

Skills live in a private monorepo (`Pavithran-Francis/skills`). At publish time, `scripts/bundle.js` copies all skill folders into `bundled-skills/` and generates `skills.json` (manifest with skill list, dependency graph, and descriptions). This means `npx` users get all skills without needing access to the private repo.

## Requirements

- Node.js 18+
- Claude Code (to use the installed skills)

## Author

Pavithran Francis — [github.com/Pavithran-Francis/skills](https://github.com/Pavithran-Francis/skills)
