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
| Option       | Type                 | Default          | Description                                                             |
| ------------ | -------------------- | ---------------- | ----------------------------------------------------------------------- |
| element      | `HTMLElement`        | `null`           | The DOM element of your menu.                                           |
| tippyOptions | `Object`             | `{}`             | [Options for tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/) |
| pluginKey    | `string | PluginKey` | `'floatingMenu'` | The key for the underlying ProseMirror plugin.                          |
| shouldShow   | `(props) => boolean` |                  | Controls whether the menu should be shown or not.                       |

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
<tiptap-demo name="Extensions/FloatingMenu"></tiptap-demo>

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
