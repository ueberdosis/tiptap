---
'@tiptap/suggestion': minor
---

Add `props.mount(element)` for fully managed popup positioning. It mounts the popup into the configured `container` (default `document.body`), keeps it anchored to the cursor, and automatically repositions on scroll, resize, and layout shifts via Floating UI's `autoUpdate` — no manual listeners required. It returns an `unmount` function to call in `onExit`.

This is additive and opt-in: mounting and positioning manually with `props.floatingUi` + `props.clientRect` remains supported as an escape hatch.
