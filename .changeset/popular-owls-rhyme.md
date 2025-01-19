---
"@tiptap/react": patch
---

This does a shallow diff between the current options and the incoming ones to determine whether we should try to write the new options and incur a state update within the editor.

It purposefully is not doing a full diff as several options are known to be problematic (callback handlers, extensions array, the content itself), so we rely on referential equality only to do this diffing which should be fairly fast since there are only about 10-15 options, and this diffs only the ones the user has actually attempted to set. Some options (e.g. editorProps, parseOptions, coreExtensionOptions) are an object that may need to be memoized by the user if they want to avoid unnecessary state updates.
