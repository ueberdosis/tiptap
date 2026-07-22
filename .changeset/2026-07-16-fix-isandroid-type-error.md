---
'@tiptap/core': patch
---

Fix a TypeScript build error in `isAndroid()` where comparing `navigator.platform` against the literal `'Android'` with `===` could fail to compile under some `lib.dom.d.ts` typings ("types have no overlap"). Switched to the same `.includes()` pattern already used by `isiOS()`, which is not affected by this TypeScript narrowing issue. No runtime behavior change.
