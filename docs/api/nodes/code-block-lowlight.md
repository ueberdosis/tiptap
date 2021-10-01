# CodeBlockLowlight
[![Version](https://img.shields.io/npm/v/@tiptap/extension-code-block-lowlight.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-code-block-lowlight)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-code-block-lowlight.svg)](https://npmcharts.com/compare/@tiptap/extension-code-block-lowlight?minimal=true)

With the CodeBlock extension you can add fenced code blocks to your documents. It’ll wrap the code in `<pre>` and `<code>` HTML tags.

Type <code>&grave;&grave;&grave;&nbsp;</code> (three backticks and a space) or <code>&Tilde;&Tilde;&Tilde;&nbsp;</code> (three tildes and a space) and a code block is instantly added for you. You can even specify the language, try writing <code>&grave;&grave;&grave;css&nbsp;</code>. That should add a `language-css` class to the `<code>`-tag.

## Installation
```bash
# with npm
npm install @tiptap/extension-code-block-lowlight

# with Yarn
yarn add @tiptap/extension-code-block-lowlight
```

## Settings
| Option              | Type     | Default       | Description                                                           |
| ------------------- | -------- | ------------- | --------------------------------------------------------------------- |
| HTMLAttributes      | `Object` | `{}`          | Custom HTML attributes that should be added to the rendered HTML tag. |
| languageClassPrefix | `String` | `'language-'` | Adds a prefix to language classes that are applied to code tags.      |

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
<tiptap-demo name="Nodes/CodeBlockLowlight"></tiptap-demo>
