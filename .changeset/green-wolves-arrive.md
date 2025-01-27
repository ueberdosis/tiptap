---
'@tiptap/core': major
---
`getPos` in `NodeViewRendererProps` type now includes `undefined` as possible return value

Before

```ts
const pos = nodeViewProps.getPos() // Type was () => number
```

After

```ts
const pos = nodeViewProps.getPos() // Type is () => number | undefined

if (pos !== undefined) {
  // Safe to use pos here
}
```
