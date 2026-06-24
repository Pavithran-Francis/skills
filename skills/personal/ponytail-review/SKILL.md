---
name: ponytail-review
description: >
  Code review focused exclusively on over-engineering. Finds what to delete:
  reinvented standard library, unneeded dependencies, speculative abstractions,
  dead flexibility. One line per finding: location, what to cut, what replaces
  it. Use when the user says "review for over-engineering", "what can we
  delete", "is this over-engineered", "simplify review", or invokes
  /ponytail-review.
license: MIT
---

# Ponytail Review

Review the diff or codebase for over-engineering only. Goal: make the code
shorter. Report findings as one line each. Apply no fixes unless explicitly
asked.

## Format

Single-file diff:
```
L<line>: <tag> <what>. <replacement>.
```

Multi-file diff:
```
<file>:L<line>: <tag> <what>. <replacement>.
```

End with: `net: -<N> lines possible.`
If nothing to cut: `Lean already. Ship.`

## Tags

| Tag | Meaning |
|-----|---------|
| `delete:` | Dead code, unused flexibility, speculative feature — no replacement needed |
| `stdlib:` | Hand-rolled reimplementation of a standard library function |
| `native:` | Dependency or code duplicating a platform capability |
| `yagni:` | Abstraction with one implementation, unused config, single-caller layer |
| `shrink:` | Identical logic achievable in fewer lines — show the compressed form |

## Scope

Over-engineering and complexity only. This review does NOT cover:
- Correctness bugs
- Security issues
- Performance concerns

Those belong in a separate review pass.
