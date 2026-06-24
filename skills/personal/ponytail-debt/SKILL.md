---
name: ponytail-debt
description: >
  Harvests every ponytail: comment in the codebase into a debt ledger so
  deliberate shortcuts and deferrals get tracked instead of rotting. Use when
  the user says "ponytail debt", "show my shortcuts", "list ponytail markers",
  or invokes /ponytail-debt.
license: MIT
---

# Ponytail Debt

Scan the codebase for `ponytail:` comments and report them as a debt ledger.
Read-only by default — make no changes unless explicitly asked.

## Scan command

```bash
grep -rnE '(#|//) ?ponytail:' . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=build
```

## Convention

Each marker follows the pattern:
```
# ponytail: <ceiling>, <upgrade path>
// ponytail: <ceiling>, <upgrade path>
```

Example:
```python
# ponytail: global lock, per-account locks if throughput matters
# ponytail: O(n²) scan, switch to indexed lookup when n > 1000
```

## Output format

Group by file:

```
file/path.ext
  L42  global lock — per-account locks if throughput matters
  L87  O(n²) scan — switch to indexed lookup when n > 1000   [no-trigger]
```

Flag entries missing an upgrade trigger with `[no-trigger]` — these are
high rot risk: a shortcut with no named condition is "later means never".

End with: `<N> markers, <M> with no trigger.`
If none found: `No ponytail: debt. Clean ledger.`

## Persistence

Results are ephemeral by default. To write a `PONYTAIL-DEBT.md` file,
the user must explicitly request it.
