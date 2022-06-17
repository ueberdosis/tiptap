---
description: Add some colorful syntax highlighting to your code blocks.
icon: terminal-box-fill
---

# CodeBlockLowlight
[![Version](https://img.shields.io/npm/v/@tiptap/extension-code-block-lowlight.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-code-block-lowlight)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-code-block-lowlight.svg)](https://npmcharts.com/compare/@tiptap/extension-code-block-lowlight?minimal=true)

With the CodeBlockLowlight extension you can add fenced code blocks to your documents. It’ll wrap the code in `<pre>` and `<code>` HTML tags.

::: warning Syntax highlight dependency
This extension relies on the [lowlight](https://github.com/wooorm/lowlight) library to apply syntax highlight to the code block’s content.
:::

Type <code>&grave;&grave;&grave;&nbsp;</code> (three backticks and a space) or <code>&Tilde;&Tilde;&Tilde;&nbsp;</code> (three tildes and a space) and a code block is instantly added for you. You can even specify the language, try writing <code>&grave;&grave;&grave;css&nbsp;</code>. That should add a `language-css` class to the `<code>`-tag.

## Installation
```bash
npm install lowlight @tiptap/extension-code-block-lowlight
```

## Settings

### lowlight

You should provide the `lowlight` module to this extension. Decoupling the `lowlight`
package from the extension allows the client application to control which
version of lowlight it uses and which programming language packages it needs to load.

```js
import { lowlight } from 'lowlight/lib/core'

CodeBlockLowlight.configure({
  lowlight,
})
```

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
CodeBlockLowlight.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### languageClassPrefix
Adds a prefix to language classes that are applied to code tags.

Default: `'language-'`

```js
CodeBlockLowlight.configure({
  languageClassPrefix: 'language-',
})
```

### defaultLanguage
Define a default language instead of the automatic detection of lowlight.

Default: `null`

```js
CodeBlockLowlight.configure({
  defaultLanguage: 'plaintext',
})
```

## Commands

### setCodeBlock()
Wrap content in a code block.

```js
editor.commands.setCodeBlock()
```

### toggleCodeBlock()
Toggle the code block.

```js
editor.commands.toggleCodeBlock()
```

## Keyboard shortcuts
| Command         | Windows/Linux                 | macOS                     |
| --------------- | ----------------------------- | ------------------------- |
| toggleCodeBlock | `Control`&nbsp;`Alt`&nbsp;`C` | `Cmd`&nbsp;`Alt`&nbsp;`C` |

## Source code
[packages/extension-code-block-lowlight/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-code-block-lowlight/)

## Usage
https://embed.tiptap.dev/preview/Nodes/CodeBlockLowlight
