"@tiptap/extension-typography": minor
---

feat(extension-typography): add opt-in RTL smart quote support

Adds new `doubleQuotes` and `singleQuotes` configuration options that allow users to specify RTL-specific quote characters. When configured, RTL quote rules replace the default LTR rules, ensuring correct quote direction for RTL languages like Arabic, Hebrew, and Persian.

Example usage:
```ts
Typography.configure({
  doubleQuotes: {
    rtl: { open: '"', close: '"' }  // Swapped quotes for RTL
  },
  singleQuotes: {
    rtl: { open: ''', close: ''' }
  }
})
```

Closes #7411
