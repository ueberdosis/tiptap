---
description: Add a toolbar that pops up above the text. Great to apply inline formatting.
icon: chat-2-line
---

# Bubble Menu
[![Version](https://img.shields.io/npm/v/@tiptap/extension-bubble-menu.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-bubble-menu)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-bubble-menu.svg)](https://npmcharts.com/compare/@tiptap/extension-bubble-menu?minimal=true)

This extension will make a contextual menu appear near a selection of text. Use it to let users apply [marks](/api/marks) to their text selection.

As always, the markup and styling is totally up to you.

## Installation
```bash
npm install @tiptap/extension-bubble-menu
```

## Settings

### element
The DOM element that contains your menu.

Type: `HTMLElement`

Default: `null`

### updateDelay
The `BubbleMenu` debounces the `update` method to allow the bubble menu to not be updated on every selection update. This can be controlled in milliseconds.
The BubbleMenuPlugin will come with a default delay of 250ms. This can be deactivated, by setting the delay to `0` which deactivates the debounce.

Type: `Number`

Default: `undefined`

### tippyOptions
Under the hood, the `BubbleMenu` uses [tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/). You can directly pass options to it.

Type: `Object`

Default: `{}`

### pluginKey
The key for the underlying ProseMirror plugin. Make sure to use different keys if you add more than one instance.

Type: `string | PluginKey`

Default: `'bubbleMenu'`

### shouldShow
A callback to control whether the menu should be shown or not.

Type: `(props) => boolean`

## Source code
[packages/extension-bubble-menu/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/)

## Usage

### JavaScript
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

### Frameworks
https://embed.tiptap.dev/preview/Extensions/BubbleMenu

### Custom logic
Customize the logic for showing the menu with the `shouldShow` option. For components, `shouldShow` can be passed as a prop.

```js
BubbleMenu.configure({
  shouldShow: ({ editor, view, state, oldState, from, to }) => {
    // only show the bubble menu for images and links
    return editor.isActive('image') || editor.isActive('link')
  },
})
```

### Multiple menus
Use multiple menus by setting an unique `pluginKey`.

```js
import { Editor } from '@tiptap/core'
import BubbleMenu from '@tiptap/extension-bubble-menu'

new Editor({
  extensions: [
    BubbleMenu.configure({
      pluginKey: 'bubbleMenuOne',
      element: document.querySelector('.menu-one'),
    }),
    BubbleMenu.configure({
      pluginKey: 'bubbleMenuTwo',
      element: document.querySelector('.menu-two'),
    }),
  ],
})
```

Alternatively you can pass a ProseMirror `PluginKey`.

```js
import { Editor } from '@tiptap/core'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import { PluginKey } from '@tiptap/pm/state'

new Editor({
  extensions: [
    BubbleMenu.configure({
      pluginKey: new PluginKey('bubbleMenuOne'),
      element: document.querySelector('.menu-one'),
    }),
    BubbleMenu.configure({
      pluginKey: new PluginKey('bubbleMenuTwo'),
      element: document.querySelector('.menu-two'),
    }),
  ],
})
```
