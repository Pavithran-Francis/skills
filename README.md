# Pavi's Skills

My centralized collection of agent skills for real engineering work. Works with Claude Code, Cursor, GitHub Copilot, and any agent that supports skills/slash commands.

Built on four remotes:

| Remote        | Repo                                                                  | Provides                           |
|---------------|-----------------------------------------------------------------------|------------------------------------|
| `upstream`    | [mattpocock/skills](https://github.com/mattpocock/skills)            | engineering, productivity, misc    |
| `caveman`     | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman)    | caveman-* token compression        |
| `superpowers` | [obra/superpowers](https://github.com/obra/superpowers)               | superpowers workflow skills        |
| `origin`      | [Pavithran-Francis/skills](https://github.com/Pavithran-Francis/skills) | personal skills, glue            |

## Setup

1. Link skills and generate the plugin manifest:

```bash
./scripts/link-skills.sh
./scripts/generate-plugin-json.sh
```

2. Run `/setup-matt-pocock-skills` in your agent to configure issue tracker, triage labels, and docs location.

## Syncing

```bash
# mattpocock/skills
git fetch upstream && git merge upstream/main

# JuliusBrussee/caveman
git subtree pull --prefix vendors/caveman caveman main --squash

# obra/superpowers
git subtree pull --prefix vendors/superpowers superpowers main --squash

# Regenerate plugin.json after any merge
./scripts/generate-plugin-json.sh
```

## Quick Reference — Which Skill When?

| I want to...                                  | Use                        |
|-----------------------------------------------|----------------------------|
| Save tokens / terse output                    | `/caveman`                 |
| Write a commit message                        | `/caveman-commit`          |
| Review a PR (compressed feedback)             | `/caveman-review`          |
| Compress a memory/config file                 | `/caveman-compress`        |
| Check token savings this session              | `/caveman-stats`           |
| Delegate work to compressed subagents         | `/cavecrew`                |
| List all caveman commands                     | `/caveman-help`            |
| Explain something in extreme detail           | `/i-am-dumb`               |
| Edit/improve an article draft                 | `/edit-article`            |
| Find/create/manage Obsidian notes             | `/obsidian-vault`          |
| Stress-test a plan before building            | `/grill-me`                |
| Stress-test a plan + update domain docs       | `/grill-with-docs`         |
| Figure out which skill to use                 | `/ask-matt`                |
| Break a plan/spec into issues                 | `/to-issues`               |
| Turn a conversation into a PRD                | `/to-prd`                  |
| Implement work from a PRD or issues           | `/implement`               |
| Build a throwaway prototype                   | `/prototype`               |
| Scan codebase for architecture improvements   | `/improve-codebase-architecture` |
| Triage issues through a state machine         | `/triage`                  |
| Set up this repo's engineering skills         | `/setup-matt-pocock-skills`|
| Hand off work to another agent                | `/handoff`                 |
| Learn a concept over multiple sessions        | `/teach`                   |
| Learn how to write good skills                | `/writing-great-skills`    |
| Debug a hard bug or perf regression           | _(auto)_ `diagnosing-bugs` |
| Build features test-first (TDD)               | _(auto)_ `tdd`             |
| Sharpen domain terminology / write ADRs       | _(auto)_ `domain-modeling` |
| Design deep modules with clean interfaces     | _(auto)_ `codebase-design` |
| Resolve merge/rebase conflicts                | _(auto)_ `resolving-merge-conflicts` |
| Set up git safety hooks                       | `/git-guardrails-claude-code` |
| Set up pre-commit hooks (Husky/lint-staged)   | `/setup-pre-commit`        |
| Migrate tests to @total-typescript/shoehorn   | `/migrate-to-shoehorn`     |
| Scaffold exercise directories for a course    | `/scaffold-exercises`      |
| Brainstorm a design before implementing       | _(auto)_ `brainstorming`   |
| Write an implementation plan                  | _(auto)_ `writing-plans`   |
| Execute a plan with subagent-per-task         | _(auto)_ `subagent-driven-development` |
| Execute a plan without subagents              | _(auto)_ `executing-plans` |
| Dispatch parallel independent tasks           | _(auto)_ `dispatching-parallel-agents` |
| Debug with root-cause-first discipline        | _(auto)_ `systematic-debugging` |
| TDD red-green-refactor cycle                  | _(auto)_ `test-driven-development` |
| Verify work before claiming done              | _(auto)_ `verification-before-completion` |
| Request a code review via subagent            | _(auto)_ `requesting-code-review` |
| Process code review feedback                  | _(auto)_ `receiving-code-review` |
| Set up an isolated git worktree               | _(auto)_ `using-git-worktrees` |
| Finish a branch (merge/PR/cleanup)            | _(auto)_ `finishing-a-development-branch` |
| Write new skills with TDD                     | _(auto)_ `writing-skills`  |

Skills marked _(auto)_ are model-invoked — the agent reaches for them when the task fits. All others require you to type the command.

---

## All Skills

Skills split on one axis — who can invoke them. **User-invoked** skills are reachable only when you type them (e.g. `/grill-me`). **Model-invoked** skills can be invoked by you _or_ reached for automatically by the agent when the task fits.

### Personal

My own skills, not synced from upstream.

**User-invoked**

- **[i-am-dumb](./skills/personal/i-am-dumb/SKILL.md)** — Explain any concept in extreme detail as if teaching a junior developer. No jargon without definitions, no skipped steps.
- **[edit-article](./skills/personal/edit-article/SKILL.md)** — Edit and improve articles by restructuring sections, improving clarity, and tightening prose.

**Model-invoked**

- **[obsidian-vault](./skills/personal/obsidian-vault/SKILL.md)** — Search, create, and manage notes in the Obsidian vault with wikilinks and index notes.

### Caveman

Token compression skills. (From [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman))

**User-invoked**

- **[caveman](./vendors/caveman/skills/caveman/SKILL.md)** — Ultra-compressed communication mode. Cuts ~75% of tokens while keeping full technical accuracy. Levels: lite, full, ultra, wenyan.
- **[caveman-commit](./vendors/caveman/skills/caveman-commit/SKILL.md)** — Terse commit messages in Conventional Commits format. Subject ≤50 chars, body only when "why" isn't obvious.
- **[caveman-review](./vendors/caveman/skills/caveman-review/SKILL.md)** — Compressed code review comments. One line per finding: location, problem, fix.
- **[caveman-compress](./vendors/caveman/skills/caveman-compress/SKILL.md)** — Compress memory files (CLAUDE.md, todos) into caveman format to save input tokens.
- **[caveman-stats](./vendors/caveman/skills/caveman-stats/SKILL.md)** — Show real token usage and estimated savings for the current session.
- **[caveman-help](./vendors/caveman/skills/caveman-help/SKILL.md)** — Quick-reference card for all caveman modes, skills, and commands.

**Model-invoked**

- **[cavecrew](./vendors/caveman/skills/cavecrew/SKILL.md)** — Delegate to caveman-style subagents (investigator, builder, reviewer) with ~60% smaller context injection.

### Superpowers

Workflow skills for planning, execution, debugging, and code review. (From [obra/superpowers](https://github.com/obra/superpowers))

**Model-invoked**

- **[brainstorming](./vendors/superpowers/skills/brainstorming/SKILL.md)** — Explore intent, requirements, and design through collaborative dialogue before any implementation.
- **[writing-plans](./vendors/superpowers/skills/writing-plans/SKILL.md)** — Write comprehensive implementation plans as bite-sized tasks with full context for the implementer.
- **[executing-plans](./vendors/superpowers/skills/executing-plans/SKILL.md)** — Load and execute a written plan with review checkpoints (for environments without subagent support).
- **[subagent-driven-development](./vendors/superpowers/skills/subagent-driven-development/SKILL.md)** — Execute plans by dispatching a fresh subagent per task with code review after each.
- **[dispatching-parallel-agents](./vendors/superpowers/skills/dispatching-parallel-agents/SKILL.md)** — Dispatch one agent per independent problem domain for concurrent execution.
- **[systematic-debugging](./vendors/superpowers/skills/systematic-debugging/SKILL.md)** — Four-phase root cause analysis: always find root cause before attempting fixes.
- **[test-driven-development](./vendors/superpowers/skills/test-driven-development/SKILL.md)** — RED-GREEN-REFACTOR cycle: write the test first, watch it fail, write minimal code to pass.
- **[verification-before-completion](./vendors/superpowers/skills/verification-before-completion/SKILL.md)** — Run verification commands and confirm output before making any completion claims.
- **[requesting-code-review](./vendors/superpowers/skills/requesting-code-review/SKILL.md)** — Dispatch a code reviewer subagent with precisely crafted context for evaluation.
- **[receiving-code-review](./vendors/superpowers/skills/receiving-code-review/SKILL.md)** — Process code review feedback with technical evaluation: verify before implementing.
- **[using-git-worktrees](./vendors/superpowers/skills/using-git-worktrees/SKILL.md)** — Ensure work happens in an isolated workspace via native tools or git worktree fallback.
- **[finishing-a-development-branch](./vendors/superpowers/skills/finishing-a-development-branch/SKILL.md)** — Guide branch completion: verify tests, present options (merge/PR/cleanup), execute choice.
- **[using-superpowers](./vendors/superpowers/skills/using-superpowers/SKILL.md)** — System introduction: establishes how to find and use superpowers skills at conversation start.
- **[writing-skills](./vendors/superpowers/skills/writing-skills/SKILL.md)** — Create new skills using TDD applied to process documentation.

### Engineering

Skills for daily code work. (From [mattpocock/skills](https://github.com/mattpocock/skills))

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)** — Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)** — Grilling session that also builds your project's domain model, sharpening terminology and updating `CONTEXT.md` and ADRs inline.
- **[triage](./skills/engineering/triage/SKILL.md)** — Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)** — Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)** — Configure this repo for the engineering skills (issue tracker, triage labels, domain doc layout). Run once per repo before using the other engineering skills.
- **[to-issues](./skills/engineering/to-issues/SKILL.md)** — Break any plan, spec, or PRD into independently-grabbable issues using vertical slices.
- **[to-prd](./skills/engineering/to-prd/SKILL.md)** — Turn the current conversation into a PRD and publish it to the issue tracker. No interview — just synthesizes what you've already discussed.
- **[prototype](./skills/engineering/prototype/SKILL.md)** — Build a throwaway prototype to flesh out a design — either a runnable terminal app for state/business-logic questions, or several radically different UI variations toggleable from one route.
- **[implement](./skills/engineering/implement/SKILL.md)** — Implement work based on a PRD or set of issues. Uses `/tdd` at pre-agreed seams.

**Model-invoked**

- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test.
- **[tdd](./skills/engineering/tdd/SKILL.md)** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)** — Actively build and sharpen a project's domain model — challenge terms against the glossary, stress-test with edge-case scenarios, and update `CONTEXT.md` and ADRs inline.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)** — Shared discipline and vocabulary for designing deep modules: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface.
- **[resolving-merge-conflicts](./skills/engineering/resolving-merge-conflicts/SKILL.md)** — Resolve in-progress git merge/rebase conflicts by understanding both intents and preserving both where possible.

### Productivity

General workflow tools, not code-specific. (From [mattpocock/skills](https://github.com/mattpocock/skills))

**User-invoked**

- **[grill-me](./skills/productivity/grill-me/SKILL.md)** — Get relentlessly interviewed about a plan or design until every branch of the decision tree is resolved.
- **[handoff](./skills/productivity/handoff/SKILL.md)** — Compact the current conversation into a handoff document so another agent can continue the work.
- **[teach](./skills/productivity/teach/SKILL.md)** — Teach the user a new skill or concept over multiple sessions, using the current directory as a stateful teaching workspace.
- **[writing-great-skills](./skills/productivity/writing-great-skills/SKILL.md)** — Reference for writing and editing skills well: the vocabulary and principles that make a skill predictable.

**Model-invoked**

- **[grilling](./skills/productivity/grilling/SKILL.md)** — Interview the user relentlessly about a plan or design until every branch of the decision tree is resolved. The reusable loop behind `grill-me` and `grill-with-docs`.

### Misc

Tools kept around but rarely used. (From [mattpocock/skills](https://github.com/mattpocock/skills))

- **[git-guardrails-claude-code](./skills/misc/git-guardrails-claude-code/SKILL.md)** — Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, etc.) before they execute.
- **[migrate-to-shoehorn](./skills/misc/migrate-to-shoehorn/SKILL.md)** — Migrate test files from `as` type assertions to @total-typescript/shoehorn.
- **[scaffold-exercises](./skills/misc/scaffold-exercises/SKILL.md)** — Create exercise directory structures with sections, problems, solutions, and explainers.
- **[setup-pre-commit](./skills/misc/setup-pre-commit/SKILL.md)** — Set up Husky pre-commit hooks with lint-staged, Prettier, type checking, and tests.
