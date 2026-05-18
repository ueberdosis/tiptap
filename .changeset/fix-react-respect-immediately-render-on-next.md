---
"@tiptap/react": patch
---

Respect explicit `immediatelyRender: true` in client-side Next.js. Previously, when running under Next.js (`window.next` present), the `immediatelyRender` option was forced to `false` even when the user explicitly passed `true`, breaking client-only Next.js apps that rely on the editor existing on the first render. The hook now only forces `false` when actual SSR is detected (`typeof window === 'undefined'`), or when running under Next.js with no explicit value.
