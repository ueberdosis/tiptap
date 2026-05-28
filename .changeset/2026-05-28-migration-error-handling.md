---
'@tiptap/core': minor
'@tiptap/extension-collaboration': minor
'@tiptap/react': patch
'@tiptap/vue-3': patch
---

Validate `documentVersion` at runtime via `setDocumentVersion`, emit `migrateError` and destroy outdated editors, observe Yjs `documentVersion` changes, publish `migrationsEnabled` / `maxMigrationVersion` on provider awareness, and handle migration init failures in React and Vue bindings.
