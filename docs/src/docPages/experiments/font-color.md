# FontColor
[![Version](https://img.shields.io/npm/v/@tiptap/extension-font-color.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-font-color)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-font-color.svg)](https://npmcharts.com/compare/@tiptap/extension-font-color?minimal=true)

This extension enables you to set the font color in the editor. It uses the [`TextStyle`](/api/marks/text-style) mark, which renders a `<span>` tag (and only that). The font color is applied as inline style then, for example `<span style="color: #958DF1">`.

## Installation
```bash
# with npm
npm install @tiptap/extension-text-style @tiptap/extension-font-color

# with Yarn
yarn add @tiptap/extension-text-style @tiptap/extension-font-color
```

This extension requires the [`TextStyle`](/api/marks/text-style) mark.

## Settings
| Option | Type    | Default         | Description                                                              |
| ------ | ------- | --------------- | ------------------------------------------------------------------------ |
| types  | `Array` | `['textStyle']` | A list of marks to which the font family attribute should be applied to. |

## Commands
| Command    | Parameters | Description                                   |
| ---------- | ---------- | --------------------------------------------- |
| fontColor | fontColor | Applies the given font color as inline style |

## Source code
[packages/extension-font-color/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-font-color/)

## Usage
<demo name="Experiments/FontColor" />
