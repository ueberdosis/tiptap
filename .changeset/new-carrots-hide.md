---
'@tiptap/suggestion': patch
---

Fixed a bug where `renderer.onExit` was called up to 3 times instead of once when pressing Escape to close an active suggestion popup.

**Note:** When exiting a suggestion via Escape or `exitSuggestion()`, `onExit` is now called from the `view.update` lifecycle after the plugin state has been applied and the DOM updated. This means `decorationNode` will be `null` inside `onExit` when exiting via Escape, as the decoration is removed from the DOM before `onExit` is invoked. If you rely on `decorationNode` in `onExit` (e.g. to position a closing animation), handle Escape manually in `onKeyDown`, capture the node there, call `exitSuggestion(view, pluginKey)` yourself, and return `true` to prevent the plugin from also dispatching the exit.
