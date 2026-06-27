# pavidev-claude-code-skills

Install and manage Pavi's Claude Code agent skills via an interactive CLI.

## Usage

```bash
npx pavidev-claude-code-skills
```

Or install globally for a persistent command:

```bash
npm install -g pavidev-claude-code-skills
claude-skills
```

## What it does

Launches an animated interactive menu to install, update, remove, and inspect Claude Code skills — the prompt files that teach Claude how to perform specialised tasks in your projects.

Skills are installed into:

| Scope   | Path                               |
|---------|------------------------------------|
| Global  | `~/.claude/skills/` + `~/.agents/skills/` |
| Project | `.claude/skills/` in current dir   |

A lockfile (`~/.claude/claude-skills-lock.json` or `.claude/claude-skills-lock.json`) tracks every installed skill with a SHA-256 hash so updates and drift can be detected.

## Menu options

| Option | Description |
|--------|-------------|
| **Add Skill(s)** | Pick from 54 bundled skills. Dependencies are resolved and installed automatically. |
| **Update Existing Skill(s)** | Detect and apply updates for skills that have a newer bundled version. |
| **Remove Existing Skill(s)** | Uninstall skills from disk and remove them from the lockfile. |
| **List Installed Skill(s)** | Show all installed skills with status, link type, and hash. |
| **Sync/Restore Skills from Lockfile** | Re-materialize any missing or broken skills from the lockfile. |
| **Check Skill(s)** | Health check — ok / update available / locally modified / missing / broken symlink. |
| **Quit** | Exit. |

Press **Escape** at any sub-prompt to go back to the main menu.

## CLI commands

All menu options are also available as direct subcommands:

```bash
claude-skills add --global --all          # install everything globally
claude-skills add --skill grilling tdd    # install specific skills
claude-skills update --global             # update all with new versions
claude-skills remove --project            # interactive remove (project scope)
claude-skills list --global               # show installed skills
claude-skills sync --global               # restore from lockfile
claude-skills check --project             # health check
```

## Included skills

54 skills spanning engineering, productivity, and personal workflows — including the full [mattpocock/skills](https://github.com/mattpocock/skills) set, [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) skills, [obra/superpowers](https://github.com/obra/superpowers) skills, and Pavi's personal additions (ponytail suite, council, etc.).

## Author

Pavithran Francis — [github.com/Pavithran-Francis/skills](https://github.com/Pavithran-Francis/skills)
