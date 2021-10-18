---
description: "Everyone needs it, nobody talks about it: the Document extension."
icon: file-line
---

# Document
[![Version](https://img.shields.io/npm/v/@tiptap/extension-document.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-document)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-document.svg)](https://npmcharts.com/compare/@tiptap/extension-document?minimal=true)

**The `Document` extension is required**, no matter what you build with tiptap. It’s a so called “topNode”, a node that’s the home to all other nodes. Think of it like the `<body>` tag for your document.

The node is very tiny though. It defines a name of the node (`doc`), is configured to be a top node (`topNode: true`) and that it can contain multiple other nodes (`block+`). That’s all. But have a look yourself:

:::warning Breaking Change from 1.x → 2.x
tiptap 1 tried to hide that node from you, but it has always been there. You have to explicitly import it from now on (or use `StarterKit`).
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-document

# with Yarn
yarn add @tiptap/extension-document
```

## Source code
[packages/extension-document/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-document/)

## Usage
https://embed.tiptap.dev/preview/Nodes/Document
