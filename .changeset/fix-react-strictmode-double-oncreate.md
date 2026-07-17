---
'@tiptap/react': patch
---

Fix `useEditor` firing `onBeforeCreate`/`onCreate` twice for two different `Editor` instances under React StrictMode. `useEditor` used a `useState` lazy initializer, which StrictMode invokes twice for a single mount, and both calls constructed (and auto-mounted) a real `Editor`. Replaced it with a guarded `useRef`, whose value isn't reset between StrictMode's double invocation, so only one `Editor` is ever constructed per mount.
