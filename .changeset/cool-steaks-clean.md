---
"@tiptap/pm": patch
---

Because of an XSS vulnerability in the `prosemirror-model` package, we've updated all our prosemirror dependencies to the latest versions.

**Upgraded packages**:

- `prosemirror-model` from `^1.22.1` to `^1.22.2`
- `prosemirror-tables` from `^1.3.7` to `^1.4.0`
- `prosemirror-trailing-node` from `^2.0.8` to `^2.0.9`
- `prosemirror-view` from `^1.33.8` to `^1.33.9`

See https://discuss.prosemirror.net/t/heads-up-xss-risk-in-domserializer/6572
