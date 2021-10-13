---
description: Limit the number of characters in your editor, or at least count them.
---

# CharacterCount
[![Version](https://img.shields.io/npm/v/@tiptap/extension-character-count.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-character-count)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-character-count.svg)](https://npmcharts.com/compare/@tiptap/extension-character-count?minimal=true)

The `CharacterCount` extension limits the number of allowed character to a specific length. That’s it, that’s all.

## Installation
```bash
# with npm
npm install @tiptap/extension-character-count

# with Yarn
yarn add @tiptap/extension-character-count
```

## Settings

### limit

The maximum number of characters that should be allowed. |

Default: `0`

```js
CharacterCount.configure({
  limit: 240,
})
```

## Source code
[packages/extension-character-count/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-character-count/)

## Usage
<tiptap-demo name="Extensions/CharacterCount"></tiptap-demo>

## Count words, emojis, letters …
Want to count words instead? Or emojis? Or the letter *a*? Sure, no problem. You can access the `textContent` directly and count whatever you’re into.

```js
new Editor({
  onUpdate({ editor }) {
    const wordCount = editor.state.doc.textContent.split(' ').length

    console.log(wordCount)
  },
})
```
