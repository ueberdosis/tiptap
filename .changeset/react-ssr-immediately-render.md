---
'@tiptap/react': patch
---

Default `immediatelyRender` to `false` in SSR environments instead of throwing an error

Previously, omitting `immediatelyRender` in an SSR environment (e.g. Next.js) would throw an error in development and silently return `null` in production. This was a common source of crashes, especially when AI-generated code set up the editor without explicitly passing `immediatelyRender: false`. The hook now defaults `immediatelyRender` to `true`, but automatically sets it to `false` when SSR is detected, logging a warning in development instead of throwing.
