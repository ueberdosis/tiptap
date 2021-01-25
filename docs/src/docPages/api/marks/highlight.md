# Highlight
[![Version](https://img.shields.io/npm/v/@tiptap/extension-highlight.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-highlight)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-highlight.svg)](https://npmcharts.com/compare/@tiptap/extension-highlight?minimal=true)

Use this extension to render highlighted text with `<mark>`. You can use only default `<mark>` HTML tag, which has a yellow background color by default, or apply different colors.

Type `==two equal signs==` and it will magically transform to <mark>highlighted</mark> text while you type.

## Installation
```bash
# with npm
npm install @tiptap/extension-highlight

# with Yarn
yarn add @tiptap/extension-highlight
```

## Settings
| Option         | Type      | Default | Description                                                           |
| -------------- | --------- | ------- | --------------------------------------------------------------------- |
| multicolor     | `Boolean` | `false` | Add support for multiple colors.                                      |
| HTMLAttributes | `Object`  | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |

## Commands
| Command         | Options            | Description               |
| --------------- | ------------------ | ------------------------- |
| setHighlight    | `color` (optional) | Mark text as highlighted. |
| toggleHighlight | `color` (optional) | Toggle a text highlight.  |
| unsetHighlight  | —                  | Removes the highlight.    |

## Keyboard shortcuts
* Windows/Linux: `Control`&nbsp;`Shift`&nbsp;`H`
* macOS: `Cmd`&nbsp;`Shift`&nbsp;`H`

## Source code
[packages/extension-highlight/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-highlight/)

## Usage
<demo name="Marks/Highlight" highlight="3-8,48,67" />
