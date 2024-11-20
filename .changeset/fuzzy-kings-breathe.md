---
"@tiptap/react": patch
---

React 19 changes how refs works, it will double mount them, all that we needed to do though was to use the JSX transform instead of createElement directly #5846
