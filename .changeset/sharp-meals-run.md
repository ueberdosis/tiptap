---
"@tiptap/extension-code-block": patch
---

Configuration options for the CodeBlock extension now support `null` and `undefined` values.
This makes custom setups more flexible and avoids unnecessary type errors when omitting optional overrides.
All existing default values and fallback logic remain in place - no breaking changes for existing code.
