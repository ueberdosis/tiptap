# Bubble Menu
[![Version](https://img.shields.io/npm/v/@tiptap/extension-bubble-menu.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-bubble-menu)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-bubble-menu.svg)](https://npmcharts.com/compare/@tiptap/extension-bubble-menu?minimal=true)

This extension will make a contextual menu appear near a selection of text. Use it to let users apply [marks](/api/marks) to their text selection.

As always, the markup and styling is totally up to you.

## Installation
```bash
# with npm
npm install @tiptap/extension-bubble-menu
# with Yarn
yarn add @tiptap/extension-bubble-menu
```

## Settings
| Option       | Type                 | Default        | Description                                                             |
| ------------ | -------------------- | -------------- | ----------------------------------------------------------------------- |
| element      | `HTMLElement`        | `null`         | The DOM element that contains your menu.                                |
| tippyOptions | `Object`             | `{}`           | [Options for tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/) |
| pluginKey    | `string \| PluginKey` | `'bubbleMenu'` | The key for the underlying ProseMirror plugin.                          |
| shouldShow   | `(props) => boolean` |                | Controls whether the menu should be shown or not.                       |

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
<tiptap-demo name="Extensions/BubbleMenu"></tiptap-demo>

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
import { PluginKey } from 'prosemirror-state'

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
