---
"@tiptap/react": patch
---

Add a `use client` directive so `@tiptap/react` can be imported from React Server Components without crashing. Core symbols re-exported through `@tiptap/react` now cross the client boundary too, so import them from `@tiptap/core` directly in server code.
