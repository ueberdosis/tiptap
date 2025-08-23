---
"@tiptap/core": minor
---

Make input rules and paste rules respect extension `priority` by registering
them per-extension instead of aggregating them into a single global plugin.

Why
---
Previously all `addInputRules()` and `addPasteRules()` were gathered into one
global plugin which ran before the other plugins. That caused conflicts where
some extensions (for example mention/suggestion with `#`) could not preempt the
built-in heading input rule.

What changed
---
- Input and paste rules are now created and registered at the position of the
  owning extension. This makes their execution order follow the extension
  sorting/`priority` mechanism.
- Behavior is more predictable: extensions with higher `priority` can now take
  precedence over lower priority extensions' input/paste rules.

Migration & compatibility
---
- This is a behavioral change. If you relied on the old global ordering (input
  rules always running before other plugins), you may observe different
  outcomes. In most cases this is desirable and fixes conflicts (like the
  `#` mention vs. heading shortcut), but be aware of the change.
- If you need to force the previous behavior for a specific rule, you can:
  - Register the rule as a ProseMirror plugin via `addProseMirrorPlugins()` on
    the extension and place it where you want it to run.
  - Adjust the extension `priority` value so the extension sits earlier or
    later in the ordering.

If you have any questions or see regressions after upgrading, please open an
issue with a small repro and we'll help triage.
