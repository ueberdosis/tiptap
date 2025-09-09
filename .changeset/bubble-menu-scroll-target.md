---
"@tiptap/extension-bubble-menu": patch
---

Listen to a custom scroll target when positioning the BubbleMenu and
ensure the scroll listener is cleaned up on destroy.

The BubbleMenu now accepts an optional `scrollTarget` option which will be
used instead of `window` when listening for scroll events that affect the
menu positioning. The plugin also removes the scroll listener during
cleanup.

No user-facing API changes other than the new optional `scrollTarget` setting.
