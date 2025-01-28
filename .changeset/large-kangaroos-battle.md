---
'@tiptap/core': major
---

`Node`, `Mark` and `Extension` config options now are strongly typed and do not allow arbitrary keys on the options object.

To add keys, like when using `extendNodeSchema` or `extendMarkSchema`, you can do this:

```ts
declare module '@tiptap/core' {
  interface NodeConfig {
    /**
     * This key will be added to all NodeConfig objects in your project
     */
    newKey?: string
  }
  interface MarkConfig {
    /**
     * This key will be added to all MarkConfig objects in your project
     */
    newKey?: string
  }
  interface ExtensionConfig {
    /**
     * This key will be added to all ExtensionConfig objects in your project
     */
    newKey?: string
  }
}
```
