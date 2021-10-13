---
description: All the popular extensions in a single extension, doesn’t get much better than this.
---

# StarterKit
[![Version](https://img.shields.io/npm/v/@tiptap/starter-kit.svg?label=version)](https://www.npmjs.com/package/@tiptap/starter-kit)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/starter-kit.svg)](https://npmcharts.com/compare/@tiptap/starter-kit?minimal=true)

The `StarterKit` is a collection of the most popular tiptap extensions. If you’re just getting started, this extension is for you.

## Installation
```bash
# with npm
npm install @tiptap/starter-kit

# with Yarn
yarn add @tiptap/starter-kit
```

## Included extensions

### Nodes
* [`Blockquote`](/api/nodes/blockquote)
* [`BulletList`](/api/nodes/bullet-list)
* [`CodeBlock`](/api/nodes/code-block)
* [`Document`](/api/nodes/document)
* [`HardBreak`](/api/nodes/hard-break)
* [`Heading`](/api/nodes/heading)
* [`HorizontalRule`](/api/nodes/horizontal-rule)
* [`ListItem`](/api/nodes/list-item)
* [`OrderedList`](/api/nodes/ordered-list)
* [`Paragraph`](/api/nodes/paragraph)
* [`Text`](/api/nodes/text)

### Marks
* [`Bold`](/api/marks/bold)
* [`Code`](/api/marks/code)
* [`Italic`](/api/marks/italic)
* [`Strike`](/api/marks/strike)

### Extensions
* [`Dropcursor`](/api/extensions/dropcursor)
* [`Gapcursor`](/api/extensions/gapcursor)
* [`History`](/api/extensions/history)

## Source code
[packages/starter-kit/](https://github.com/ueberdosis/tiptap/blob/main/packages/starter-kit/)

## Usage
Pass `StarterKit` to the editor to load all included extension at once.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  content: '<p>Example Text</p>',
  extensions: [
    StarterKit,
  ],
})
```

You can configure the included extensions, or even disable a few of them, like shown below.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  content: '<p>Example Text</p>',
  extensions: [
    StarterKit.configure({
      // Disable an included extension
      history: false,

      // Configure an included extension
      heading: {
        levels: [1, 2],
      },
    }),
  ],
})
```
