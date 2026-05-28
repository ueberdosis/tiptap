---
'@tiptap/core': minor
'@tiptap/extension-collaboration': minor
---

Add document migrations for versioned schema upgrades: `createMigration`, declarative ops (`renameNode`, `unwrapNode`, `removeNode`, mark ops, and more), `migrateContent`, lifecycle events (`beforeMigrate`, `migrate`, `migrateStep`, `migrateError`), and optional `setContent({ migrate: true, documentVersion })`.

When `data.documentVersion` is lower than the latest migration version, migrations run on init and update `documentVersion` (see `getData()`).

`@tiptap/extension-collaboration` syncs `documentVersion` with the Yjs map `tiptap__documentVersion` (`value` key) when `syncDocumentVersion` is enabled (default).
