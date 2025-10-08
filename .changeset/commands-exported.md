---
"@tiptap/core": minor
---

Export commands and their TypeScript typings from the core package.

All commands and their corresponding TypeScript types are now exported from `@tiptap/core` so they can be imported and referenced directly by consumers. This makes it easier to build typed helpers, extensions, and tests that depend on the command signatures.

Why:
- Previously some command option types were only available as internal types or scattered across files, which made it awkward for downstream users to import and reuse them.

```ts
import { commands } from '@tiptap/core'
```

Notes:
- This is a non-breaking, additive change. It improves ergonomics for TypeScript consumers.
- If you rely on previously private/internal types, prefer the exported types from `@tiptap/core` going forward.
