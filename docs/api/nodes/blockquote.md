# Blockquote
[![Version](https://img.shields.io/npm/v/@tiptap/extension-blockquote.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-blockquote)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-blockquote.svg)](https://npmcharts.com/compare/@tiptap/extension-blockquote?minimal=true)

The Blockquote extension enables you to use the `<blockquote>` HTML tag in the editor. This is great to use quotes in the editor.

Type <code>>&nbsp;</code> at the beginning of a new line and it will magically transform to a blockquote.

## Installation
```bash
# with npm
npm install @tiptap/extension-blockquote

# with Yarn
yarn add @tiptap/extension-blockquote
```

## Settings
| Option         | Type     | Default | Description                                                           |
| -------------- | -------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |

## Commands
| Command    | Parameters | Description                   |
| ---------- | ---------- | ----------------------------- |
| blockquote | —          | Wrap content in a blockquote. |

## Keyboard shortcuts
* Windows/Linux: `Control`&nbsp;`Shift`&nbsp;`B`
* macOS: `Cmd`&nbsp;`Shift`&nbsp;`B`

## Source code
[packages/extension-blockquote/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-blockquote/)

## Usage
<tiptap-demo name="Nodes/Blockquote"></tiptap-demo>
