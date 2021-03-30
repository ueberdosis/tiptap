# Bubble Menu
[![Version](https://img.shields.io/npm/v/@tiptap/extension-bubble-menu.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-bubble-menu)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-bubble-menu.svg)](https://npmcharts.com/compare/@tiptap/extension-bubble-menu?minimal=true)

This extension will make a contextual menu appear near a selection of text.

## Installation
```bash
# with npm
npm install @tiptap/extension-bubble-menu
# with Yarn
yarn add @tiptap/extension-bubble-menu
```

## Settings
| Option       | Type          | Default   | Description |
| ------------ | ------------- | --------- | ----------- |
| element      | `HTMLElement` | `null`    |             |
| keepInBounds | `Boolean`     | `true`    |             |

## Source code
[packages/extension-bubble-menu/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-bubble-menu/)

## Vanilla JavaScript
```js
import { Editor } from '@tiptap/core'
import BubbleMenu from '@tiptap/extension-bubble-menu'

new Editor({
  extensions: [
    BubbleMenu.configure({
      element: document.querySelector('.menu'),
    }),
  ],
})
```

## Vue
<demo name="Extensions/BubbleMenu" />
