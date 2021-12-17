---
description: Make a toolbar appear automagically on empty lines.
icon: menu-4-line
---

# Floating Menu
[![Version](https://img.shields.io/npm/v/@tiptap/extension-floating-menu.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-floating-menu)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-floating-menu.svg)](https://npmcharts.com/compare/@tiptap/extension-floating-menu?minimal=true)

This extension will make a contextual menu appear near a selection of text.

## Installation
```bash
npm install @tiptap/extension-floating-menu
```

## Settings

### element
The DOM element that contains your menu.

Type: `HTMLElement`

Default: `null`

### tippyOptions
Under the hood, the `FloatingMenu` uses [tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/). You can directly pass options to it.

Type: `Object`

Default: `{}`

### pluginKey
The key for the underlying ProseMirror plugin. Make sure to use different keys if you add more than one instance.

Type: `string | PluginKey`

Default: `'floatingMenu'`

### shouldShow
A callback to control whether the menu should be shown or not.

Type: `(props) => boolean`

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
https://embed.tiptap.dev/preview/Extensions/FloatingMenu

### Custom logic
Customize the logic for showing the menu with the `shouldShow` option. For components, `shouldShow` can be passed as a prop.

```js
FloatingMenu.configure({
  shouldShow: ({ editor, view, state, oldState }) => {
    // show the floating within any paragraph
    return editor.isActive('paragraph')
  },
})
```

### Multiple menus
Use multiple menus by setting an unique `pluginKey`.

```js
import { Editor } from '@tiptap/core'
import FloatingMenu from '@tiptap/extension-floating-menu'

new Editor({
  extensions: [
    FloatingMenu.configure({
      pluginKey: 'floatingMenuOne',
      element: document.querySelector('.menu-one'),
    }),
    FloatingMenu.configure({
      pluginKey: 'floatingMenuTwo',
      element: document.querySelector('.menu-two'),
    }),
  ],
})
```

Alternatively you can pass a ProseMirror `PluginKey`.

```js
import { Editor } from '@tiptap/core'
import FloatingMenu from '@tiptap/extension-floating-menu'
import { PluginKey } from 'prosemirror-state'

new Editor({
  extensions: [
    FloatingMenu.configure({
      pluginKey: new PluginKey('floatingMenuOne'),
      element: document.querySelector('.menu-one'),
    }),
    FloatingMenu.configure({
      pluginKey: new PluginKey('floatingMenuOne'),
      element: document.querySelector('.menu-two'),
    }),
  ],
})
```
