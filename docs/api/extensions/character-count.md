---
description: Limit the number of characters in your editor, or at least count them.
icon: calculator-line
---

# CharacterCount
[![Version](https://img.shields.io/npm/v/@tiptap/extension-character-count.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-character-count)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-character-count.svg)](https://npmcharts.com/compare/@tiptap/extension-character-count?minimal=true)

The `CharacterCount` extension limits the number of allowed character to a specific length. That’s it, that’s all.

## Installation
```bash
npm install @tiptap/extension-character-count
```

## Settings

### limit

The maximum number of characters that should be allowed.

Default: `0`

```js
CharacterCount.configure({
  limit: 240,
})
```

### mode

The mode by which the size is calculated.

Default: `'textSize'`

```js
CharacterCount.configure({
  mode: 'nodeSize',
})
```

## Storage

### characters()
Get the number of characters for the current document.

```js
editor.storage.characterCount.characters()

// Get the size of a specific node.
editor.storage.characterCount.characters({ node: someCustomNode })

// Overwrite the default `mode`.
editor.storage.characterCount.characters({ mode: 'nodeSize' })
```

### words()
Get the number of words for the current document.

```js
editor.storage.characterCount.words()

// Get the number of words for a specific node.
editor.storage.characterCount.words({ node: someCustomNode })
```

## Source code
[packages/extension-character-count/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-character-count/)

## Usage
https://embed.tiptap.dev/preview/Extensions/CharacterCount
