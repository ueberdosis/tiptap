---
'@tiptap/extension-table': patch
---

Replace the negative lookbehind in the table markdown pipe-escape regex with an equivalent lookbehind-free pattern. WebKit before Safari 16.4 cannot parse lookbehind assertions, and since the regex was a literal, the entire chunk containing the table extension failed at parse time on those browsers — any bundle importing `@tiptap/extension-table` ≥ 3.27.2 was unusable on iOS/Safari < 16.4.
