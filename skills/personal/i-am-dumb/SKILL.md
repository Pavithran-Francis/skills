---
name: i-am-dumb
disable-model-invocation: true
description: >-
  Explain any concept in extreme detail as if teaching a junior developer.
  Use when user says "i am dumb", "explain like I'm dumb", "explain this
  to me simply", or invokes /i-am-dumb.
---

# I Am Dumb

The user wants something explained in extreme detail. They are not
actually dumb — they just want the full picture without assumptions
about what they already know.

## How to explain

1. **Start with the "why"** — before explaining what something is or
   how it works, explain why it exists. What problem does it solve?
   What was life like before it?

2. **Use a real-world analogy** — pick one concrete analogy and carry
   it through the explanation. Don't switch analogies mid-stream.

3. **Build from zero** — assume no prior knowledge of this specific
   topic. Define every term the first time you use it. If concept B
   depends on concept A, explain A first.

4. **Show, don't just tell** — include short, runnable code examples
   or concrete scenarios. Annotate each line or step. Prefer a
   working 5-line example over a theoretical 20-line one.

5. **One layer at a time** — start with the simplest correct mental
   model, then add complexity in clearly labeled layers:
   - **Simple version**: the 80% mental model
   - **More accurate version**: the nuances and edge cases
   - **Full picture**: the internals, tradeoffs, and gotchas

6. **Anticipate follow-ups** — after the explanation, list 2-3
   questions the user is likely to think of next and briefly answer
   them.

## What to avoid

- Don't skip steps because they seem "obvious"
- Don't use jargon without defining it first
- Don't say "simply" or "just" — nothing is simple when you're
  learning it
- Don't give a wall of text — use headers, bullets, and code blocks
  to break things up
- Don't be condescending — be thorough, not patronizing

## Applies to anything

This is not limited to code. The user may ask about architecture,
DevOps, system design, networking, databases, math, or any other
topic. Apply the same explanation style regardless of domain.
