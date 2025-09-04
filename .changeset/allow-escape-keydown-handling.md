---
"@tiptap/suggestion": patch
---

Allow consumers to handle the Escape key via `render().onKeyDown` before the suggestion plugin auto-exits.

Previously the suggestion plugin intercepted Escape internally and immediately called `onExit`, preventing `render().onKeyDown` from receiving the event and stopping propagation. Now `render().onKeyDown` is invoked first for Escape; if it returns `true` the plugin assumes the consumer handled the event (so they can call `event.preventDefault()` / `event.stopPropagation()` and optionally call `exitSuggestion(view)` themselves). If it returns `false` (or is absent), the plugin will continue to call `onExit` and close the suggestion as before.

This change enables scenarios where the editor is inside a modal/drawer and the consumer needs to prevent the outer UI from reacting to Escape while still controlling the suggestion's lifecycle.
