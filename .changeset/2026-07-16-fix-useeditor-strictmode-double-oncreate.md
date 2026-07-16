---
'@tiptap/react': patch
---

Fix `useEditor()` calling `onCreate` twice (with two different `Editor` instances) when mounted under `React.StrictMode`.

The editor instance manager was created via `useState(() => new EditorInstanceManager(...))`. React Strict Mode intentionally invokes `useState` lazy initializer functions twice in development to surface side effects that aren't idempotent — since constructing `EditorInstanceManager` synchronously constructs a real `Editor` (and can trigger its `onCreate` callback), this produced two separate editor instances, each firing `onCreate` once, even though only one instance ultimately became the component's state.

Switched to a guarded `useRef` (`if (instanceManagerRef.current === null) { instanceManagerRef.current = new EditorInstanceManager(...) }`) instead. Unlike a `useState` initializer, a ref's `current` value is not reset between Strict Mode's double invocation, so the guard only ever constructs one instance. No public API change.
