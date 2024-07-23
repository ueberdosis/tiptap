---
"@tiptap/extension-link": patch
---

Links were opening twive when the editor was not editable and openOnclick was true, now openOnClick setting will check if it is editable before trying to open programmatically resolves #4877
