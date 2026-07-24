---
'@tiptap/react': patch
---

Fix `useEditor` firing `onCreate` twice for two different `Editor` instances under React StrictMode. `useEditor`'s `useState` lazy initializer is invoked twice by StrictMode for a single mount, and both calls construct (and auto-mount) a real `Editor`, so both used to schedule their own `create` event. `onCreate` is now buffered until the owning instance is confirmed mounted (i.e. its render effect actually runs) and only forwarded then - an instance whose effect never runs (the discarded one) never forwards it. Verified against React 18.2.0, 18.3.1, and 19.1.0.
