---
"@tiptap/core": patch
---

Guard the `commands`, `chain()`, `can()`, `getHTML()`, and `getText()` getters against the null `commandManager` / `schema` references that `Editor.destroy()` leaves behind, so stale async callbacks racing the editor lifecycle no longer crash with `Cannot read properties of null (reading 'commands')`. The getters return safe no-op values (commands return `false`; `getHTML`/`getText` return `""`) when the editor is destroyed, restoring pre-3.23 behavior.
