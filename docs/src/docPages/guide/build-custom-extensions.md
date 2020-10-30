# Build custom extensions

## toc

## Introduction
One of the strength of tiptap is it’s extendability. You don’t depend on the provided extensions, it’s intended to extend the editor to your liking. With custom extensions you can add new content types and new functionalities, on top of what already exists or starting from scratch.

## Option 1: Extend existing extensions
Let’s say you want to change the keyboard shortcuts for the bullet list. You should start by looking at [the source code of the `BulletList` extension](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-bullet-list/index.ts) and find the part you would like to change. In that case, the keyboard shortcut, and just that.

Every extension has an `extend()` method, which takes an object with everything you want to change or add to it. For the bespoken example, your code could like that:

```js
// 1. Import the extension
import BulletList from '@tiptap/extension-bullet-list'

// 2. Overwrite the keyboard shortcuts
const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-l': () => this.editor.bulletList(),
    }
  },
})

// 3. Add the custom extension to your editor
new Editor({
  extensions: [
    CustomBulletList(),
    // …
  ]
})
```

The same applies to every aspect of an existing extension, except to the name. Let’s look at all the things that you can change through the extend method. We focus on one aspect in every example, but you can combine all those examples and change multiple aspects in one `extend()` call too.

### Name
The extension name is used in a whole lot of places and changing it isn’t too easy. If you want to change the name of an extension, it’s recommended to copy the whole extension and change the name in all occurrences.

The extension name is also part of the JSON. If you [store your content as JSON](http://localhost:3000/guide/store-content#option-1-json), you need to change the name in there too.

### Settings
All settings can be overwritten through the extension anyway, but if you want to change the defaults, for example to provide a library on top of tiptap for other developers, you can do it like that:

```js
import Heading from '@tiptap/extension-heading'

const CustomHeading = Heading.extend({
  defaultOptions: {
    levels: [1, 2, 3],
  },
})
```

### Schema
Tiptap works with a [strict schema](/api/schema), which configures how the content can be structured, nested, how it behaves and many more things. You can change all aspects of the schema for existing extensions. Let’s walk through a few common use cases.

The default `Blockquote` extension can wrap other nodes, like headings. If you want to allow nothing but paragraphs in your blockquotes, this is how you could achieve it:

```js
// blockquotes include paragraphs only
import Blockquote from '@tiptap/extension-blockquote'

const CustomBlockquote = Blockquote.extend({
  content: 'paragraph*',
})
```

The schema even allows to make your nodes draggable, that’s what the `draggable` option is for, which defaults to `false`. Here is an example for draggable paragraphs:

```js
// draggable paragraphs
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph.extend({
  draggable: true,
})
```

### Commands

```js
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph.extend({
  addCommands() {
    return {
      paragraph: () => ({ commands }) => {
        return commands.toggleBlockType('paragraph', 'paragraph')
      },
    }
  },
})
```

### Attributes


### Keyboard shortcuts
Most core extensions come with sensible keyboard shortcut defaults. Depending on what you want to build, you’ll likely want to change them though. With the `addKeyboardShortcuts()` method you can overwrite the predefined shortcut map:

```js
// change the bullet list keyboard shortcut
import BulletList from '@tiptap/extension-bullet-list'

const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-l': () => this.editor.bulletList(),
    }
  },
})
```

### Input rules

```js
// use the ~single tilde~ markdown shortcut
import Strike from '@tiptap/extension-strike'
import { markInputRule } from '@tiptap/core'

const inputRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))$/gm

const CustomStrike = Strike.extend({
  addInputRules() {
    return [
      markInputRule(inputRegex, this.type),
    ]
  },
})
```

### Paste rules

```js
// overwrite the underline regex for pasted text
import Underline from '@tiptap/extension-underline'
import { markPasteRule } from '@tiptap/core'

const pasteRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))$/gm

const CustomUnderline = Underline.extend({
  addPasteRules() {
    return [
      markPasteRule(inputRegex, this.type),
    ]
  },
})
```

## Option 2: Start from scratch

### Read the documentation
Although tiptap tries to hide most of the complexity of ProseMirror, it’s built on top of its APIs and we recommend you to read through the [ProseMirror Guide](https://ProseMirror.net/docs/guide/) for advanced usage. You’ll have a better understanding of how everything works under the hood and get more familiar with many terms and jargon used by tiptap.

### Have a look at existing extensions

### Get started

### Ask questions

### Share your extension
