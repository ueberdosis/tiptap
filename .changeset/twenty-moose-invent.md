---
'@tiptap/core': major
---

`editor.storage` is now strongly typed `Storage` instances, using a similar pattern as commands, where you can define the type of the storage value using namespaces like:

```ts
declare module '@tiptap/core' {
  interface Storage {
    extensionName: StorageValue
  }
}
```
