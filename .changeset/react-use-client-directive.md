---
"@tiptap/react": patch
---

Add a `use client` directive to the package entry so `@tiptap/react` can be imported from a React Server Component without crashing. Previously any import (for example `ReactNodeViewRenderer`) threw `Class extends value undefined is not a constructor or null` during the server render pass, because the client-only class components were evaluated in the server graph. The directive marks the package as a client boundary, which every RSC bundler honors, while staying inert in normal client and SSR setups. Note that core symbols re-exported through `@tiptap/react` now also cross that boundary, so import them from `@tiptap/core` directly in server code.
