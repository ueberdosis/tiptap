---
'@tiptap/markdown': patch
---

Fix blank lines being dropped after block tokens (headings, tables, …) when parsing markdown. marked's heading and table tokenizers match a trailing `\n+`, absorbing the blank lines that follow the block into the token's own `raw` instead of emitting a separate `space` token. Because empty paragraphs were only reconstructed from `space` tokens, one empty paragraph was lost on every parse — eroding one blank line per parse/serialize round-trip in editors that persist content as markdown. Blank lines absorbed into a block token's `raw` are now recovered using the same accounting the `space`-token path uses.
