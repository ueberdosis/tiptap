---
"@tiptap/core": patch
---

Fix paste rule handling for node views and defensively guard empty ranges.

This patch ensures paste rules can correctly inspect node content when
node-specific size metadata (`nodeSize`) is present, falling back to
`node.content.size` when needed. It also skips empty or invalid node ranges
before calling `textBetween`, preventing runtime errors originating from
internal Fragment/Node traversals (for example: "Cannot read properties of
undefined (reading 'nodeSize')").

The change is a defensive bugfix; it does not change public APIs.
