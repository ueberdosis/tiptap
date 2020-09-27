# Custom Extensions
Let’s extend tiptap with a custom extension!

## Table of Contents

## Option 1: Change defaults

Let’s say you want to change the keyboard shortcuts for the bullet list. You should start by looking at [the source code of the `BulletList` extension](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-bullet-list/index.ts) and find the default you’d like to change. In that case, the keyboard shortcut, and just that.

```js
// 1. Import the extension
import BulletList from '@tiptap/extension-bullet-list'

// 2. Overwrite the keyboard shortcuts
const CustomBulletList = BulletList()
  .keys(({ editor }) => ({
    'Mod-l': () => editor.bulletList(),
  }))
  .create() // Don’t forget that!

// 3. Add the custom extension to your editor
new Editor({
  extensions: [
      CustomBulletList(),
      // …
  ]
})
```

You can overwrite every aspect of an existing extension:

### Name

```js
import Document from '@tiptap/extension-document'

const CustomDocument = Document()
  .name('doc')
  .create()
```

### Settings

```js
import Heading from '@tiptap/extension-heading'

const CustomHeading = Heading()
  .defaults({
    levels: [1, 2, 3],
    class: 'my-custom-heading',
  })
  .create()
```

### Schema

```js
import Code from '@tiptap/extension-code'

const CustomCode = Code()
  .schema(() => ({
    excludes: '_',
    parseDOM: [
      { tag: 'code' },
    ],
    toDOM: () => ['code', { 'data-attribute': 'foobar' }, 0],
  }))
  .create()
```

### Commands

```js
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph()
  .commands(() => ({
    paragraph: () => ({ commands }) => {
      return commands.toggleBlockType(name, 'paragraph')
    },
  }))
  .create()
```

### Keyboard shortcuts

```js
import BulletList from '@tiptap/extension-bullet-list'

const CustomBulletList = BulletList()
  .keys(({ editor }) => ({
    'Mod-l': () => editor.bulletList(),
  }))
  .create()
```

### Input rules

```js
import Strike from '@tiptap/extension-strike'
import { markInputRule } from '@tiptap/core'

const inputRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))$/gm

const CustomStrike = Strike()
  .inputRules(({ type }) => [
    markInputRule(inputRegex, type),
  ])
  .create()
```

### Paste rules

```js
import Underline from '@tiptap/extension-underline'
import { markPasteRule } from '@tiptap/core'

const pasteRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))$/gm

const CustomUnderline = Underline()
  .pasteRules(({ type }) => [
    markPasteRule(pasteRegex, type),
  ])
  .create()
```

## Option 2: Extend existing extensions

## Option 3: Start from scratch

### 1. Read the documentation
Although tiptap tries to hide most of the complexity of ProseMirror, it’s built on top of its APIs and we recommend you to read through the [ProseMirror Guide](https://ProseMirror.net/docs/guide/) for advanced usage. You’ll have a better understanding of how everything works under the hood and get more familiar with many terms and jargon used by tiptap.

### 2. Have a look at existing extensions

### 3. Get started

### 4. Ask questions

### 5. Publish a community extension
