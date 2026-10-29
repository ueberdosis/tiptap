---
'@tiptap/react': minor
---

`useEditor` is now typed as returning `Editor | null` whatever `immediatelyRender` is set to. The hook's instance store can hold `null` whenever the component remounts, because the previous instance is destroyed on a timer while the next one is only created in an effect, and an `immediatelyRender` typed as `boolean` never matched the `false` overload. The non-null overload let callers drop guards the runtime still needs, which surfaced as `Cannot read properties of null (reading 'setOptions')`.
