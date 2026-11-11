---
'@tiptap/html': patch
---

`require('@tiptap/html')` in Node now loads the server build, the same as `import` does. Previously it always loaded the browser build, so `generateHTML` and `generateJSON` threw in CommonJS projects.
