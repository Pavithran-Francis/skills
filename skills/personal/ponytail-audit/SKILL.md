---
name: ponytail-audit
description: >
  Whole-repo audit for over-engineering. Generates a ranked list of what to
  delete, simplify, or replace with stdlib/native equivalents across the entire
  codebase. One-shot report, no fixes applied. Use when the user says "audit
  for over-engineering", "what can we delete from this repo", "full codebase
  simplification", or invokes /ponytail-audit.
license: MIT
---

# Ponytail Audit

Scan the entire repository for over-engineering. Produce a ranked list of
findings by impact. Apply no changes — report only unless user explicitly
requests fixes.

## What to hunt for

- Unnecessary dependencies (something a few lines could replace)
- Single-implementation interfaces
- One-product factories
- Delegating wrappers that add no value
- Single-export files
- Hand-rolled reimplementations of stdlib or platform functions

## Format

One line per finding, ranked by estimated impact (highest first):

```
<tag> <description>. <alternative>. [file_path]
```

End with: `net: -<N> lines, -<M> dependencies possible.`
If nothing to cut: `Lean already. Ship.`

## Tags

| Tag | Meaning |
|-----|---------|
| `delete:` | Dead code, unused flexibility — no replacement needed |
| `stdlib:` | Hand-rolled reimplementation of a standard library function |
| `native:` | Dependency or code duplicating a platform capability |
| `yagni:` | Abstraction with one implementation, unused config, single-caller layer |
| `shrink:` | Identical logic achievable in fewer lines |

## Scope

Over-engineering only. Does not cover correctness, security, or performance.
