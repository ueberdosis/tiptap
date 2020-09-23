# Document
**The `Document` extension is required**, no matter what you build with tiptap. It’s a so called “topNode”, a node that’s the home to all other nodes. Think of it like the `<body>` tag for your document.

The node is very tiny though. It defines a name of the node (`document`), is configured to be a top node (`topNode: true`) and that it can contain multiple other nodes (`block`). That’s all. But have a look yourself:

:::warning Breaking Change from 1.x → 2.x
Tiptap 1 tried to hide that node from you, but it has always been there. A tiny, but important change though: **We renamed the default type from `doc` to `document`.** To keep it like that, use your own implementation of the `Document` node or migrate the stored JSON to use the new name.
:::

## Installation
```bash
# With npm
npm install @tiptap/extension-document

# Or: With Yarn
yarn add @tiptap/extension-document
```

## Source code
[packages/extension-document/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-document/)

## Usage
<demo name="Extensions/Document" highlight="10,28" />