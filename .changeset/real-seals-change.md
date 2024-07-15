---
"tiptap-demos": patch
---

Updated demos and reverted vue specific performance enhancements until we know they work

> in commit ff04353b3ee0e6fc63733a673e2b27d2272a3355 revert: "fix(vue-3): faster component rendering (#5206)"
> This reverts commit 31f37464912b7b21f3a565ca63222b9f5b6cce00.

and

> in commit dbab8e42eac893a0237566fb30c14b4ed0f3674a revert: "fix(vue-3): fix editor.state updating too late during a transaction due to reactiveState fixes #4870 (#5252)"
> This reverts commit 509676ed4a63b84b904a98c1e34d18449d25c2a7.
