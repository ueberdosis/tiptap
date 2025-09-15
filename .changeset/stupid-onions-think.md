---
"@tiptap/extension-bubble-menu": patch
"@tiptap/react": patch
"@tiptap/vue-2": patch
"@tiptap/vue-3": patch
---

Add custom positioning support to the BubbleMenu.

This change adds an opt-in API that allows consumers to fully control how the BubbleMenu is positioned. Instead of relying solely on the internal placement logic, you can now provide a function (for example `getPosition`) that receives the relevant context (editor instance and menu DOM element) and returns the desired coordinates or positioning style.
