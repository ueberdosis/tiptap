# Subscript
[![Version](https://img.shields.io/npm/v/@tiptap/extension-subscript.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-subscript)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-subscript.svg)](https://npmcharts.com/compare/@tiptap/extension-subscript?minimal=true)

Use this extension to render text in <sub>subscript</sub>. If you pass `<sub>` or text with `vertical-align: sub` as inline style in the editor’s initial content, both will be normalized to a `<sub>` HTML tag.

## Installation
```bash
# with npm
npm install @tiptap/extension-subscript

# with Yarn
yarn add @tiptap/extension-subscript
```

## Settings
| Option         | Type     | Default | Description                                                           |
| -------------- | -------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |

## Commands
| Command         | Parameters | Description               |
| --------------- | ---------- | ------------------------- |
| setSubscript    | —          | Mark text as subscript. |
| toggleSubscript | —          | Toggle subscript mark.  |
| unsetSubscript  | —          | Remove subscript mark.  |

## Keyboard shortcuts
* Windows/Linux: `Control`&nbsp;`,`
* macOS: `Cmd`&nbsp;`,`

## Source code
[packages/extension-subscript/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-subscript/)

## Usage
<demo name="Marks/Subscript" highlight="3-5,16,35" />
