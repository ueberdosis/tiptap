---
"@tiptap/suggestion": patch
---

Remove the global document `mousedown` handler that closed suggestion popups when clicking outside.

Previously the suggestion plugin listened for document `mousedown` events and closed suggestion UIs when the user clicked outside the editor or suggestion portal. That behavior has been removed to avoid framework-specific coupling (for example reliance on `.react-renderer`) and related compatibility issues.

Now suggestions are closed via other signals:

- pressing Escape (unchanged)
- selection/cursor changes
- renderer.onExit (renderers can call this)
- programmatic calls to `exitSuggestion(view)`
