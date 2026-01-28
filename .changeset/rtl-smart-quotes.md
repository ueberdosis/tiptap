---
"@tiptap/extension-typography": minor
---

feat(extension-typography): add RTL smart quote support

Adds automatic RTL smart quote detection and optional explicit configuration for the Typography extension.

**Automatic RTL Detection:**
When `editor.options.textDirection` is set to `'rtl'`, the extension now automatically uses RTL-swapped smart quotes without requiring explicit configuration.

**Manual Configuration (optional):**
You can still explicitly configure RTL quotes using the new `doubleQuotes` and `singleQuotes` options:

```ts
Typography.configure({
  doubleQuotes: {
    rtl: { open: '\u201D', close: '\u201C' }
  },
  singleQuotes: {
    rtl: { open: '\u2019', close: '\u2018' }
  }
})
```

Manual configuration takes precedence over automatic detection, allowing full control when needed.

Closes #7411
