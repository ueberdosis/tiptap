# Floating Menu
[![Version](https://img.shields.io/npm/v/@tiptap/extension-floating-menu.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-floating-menu)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-floating-menu.svg)](https://npmcharts.com/compare/@tiptap/extension-floating-menu?minimal=true)

This extension will make a contextual menu appear near a selection of text.

## Installation
```bash
# with npm
npm install @tiptap/extension-floating-menu
# with Yarn
yarn add @tiptap/extension-floating-menu
```

## Settings
| Option       | Type          | Default | Description                                                             |
| ------------ | ------------- | ------- | ----------------------------------------------------------------------- |
| element      | `HTMLElement` | `null`  | The DOM element of your menu.                                           |
| tippyOptions | `Object`      | `{}`    | [Options for tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/) |

## Source code
[packages/extension-floating-menu/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-floating-menu/)

## Using Vanilla JavaScript
```js
import { Editor } from '@tiptap/core'
import FloatingMenu from '@tiptap/extension-floating-menu'

new Editor({
  extensions: [
    FloatingMenu.configure({
      element: document.querySelector('.menu'),
    }),
  ],
})
```

## Using a framework
<demos :items="{
  Vue: 'Extensions/FloatingMenu/Vue',
  React: 'Extensions/FloatingMenu/React',
}" />
