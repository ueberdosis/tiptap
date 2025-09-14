---
'@tiptap/core': patch
---

When the editor view is created, it now will also include `nodeViews` and `markViews` properties instead of setting them afterward. This avoids serialization of the editor state to HTML which will be replaced by node views anyway.
