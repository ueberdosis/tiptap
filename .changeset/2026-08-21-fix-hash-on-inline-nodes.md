---
'@tiptap/ai-toolkit': patch
---

The Server AI Toolkit no longer adds `_hash` to inline nodes. Inline nodes were only detected when they declared a static `group`, so nodes that set it from options, like Image, Audio, YouTube and Twitch with `inline: true`, were treated as block nodes.
