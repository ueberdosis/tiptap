---
'@tiptap/core': patch
---

Fixed a memory leak where `Editor.destroy()` did not release the Extension parent/child graph. Module-scope extension singletons retained references to configured extensions, preventing garbage collection of extension options (including DOM closures). The fix also cleans up `ExtensionManager`, `schema`, and `commandManager` references on destroy.
