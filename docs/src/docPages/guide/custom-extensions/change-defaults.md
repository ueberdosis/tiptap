# Change defaults

## Name

```js
import Document from '@tiptap/extension-document'

const CustomDocument = Document()
  .name('doc')
  .create()
```

## Settings

```js
import Heading from '@tiptap/extension-heading'

const CustomHeading = Heading()
  .defaults({
    levels: [1, 2, 3],
    class: 'my-custom-heading',
  })
  .create()
```

## Schema

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

## Commands

```js
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph()
  .commands(() => ({
    paragraph: () => ({ commands }) => {
      return commands.toggleNode(name, 'paragraph')
    },
  }))
  .create()
```

## Keyboard shortcuts

```js
import BulletList from '@tiptap/extension-bullet-list'

const CustomBulletList = BulletList()
  .keys(({ editor }) => ({
    'Mod-l': () => editor.bulletList(),
  }))
  .create()
```

## Input rules

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

## Paste rules

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
