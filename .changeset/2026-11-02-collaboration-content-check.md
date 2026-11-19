---
'@tiptap/extension-collaboration': minor
---

With `enableContentCheck: true`, shared content that does not fit the editor schema now emits `contentError` instead of being deleted. The editor pauses editing and sends no changes until compatible content arrives, so read-only users no longer send repairs that the server rejects.

If you use `enableContentCheck` with collaboration and want the editor to keep repairing invalid content, turn the content check off.
