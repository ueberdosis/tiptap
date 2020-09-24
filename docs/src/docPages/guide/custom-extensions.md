# Custom Extensions
Let’s extend tiptap with a custom extension!

## Option 1: Change defaults

Let’s say you want to change the keyboard shortcuts for the bullet list. You should start by looking at [the source code of the `BulletList` extension](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-bullet-list/index.ts) and find the default you’d like to change. In that case, the keyboard shortcut, and just that.

```js
// 1. Import the extension
import BulletList from '@tiptap/extension-bullet-list'

// 2. Overwrite the keyboard shortcuts
const CustomBulletList = BulletList()
  .keys(({ editor }) => ({
    'Mod-l': () => editor.bulletList(),
  }))
  .create() // Don’t forget that!

// 3. Add the custom extension to your editor
new Editor({
  extensions: [
      CustomBulletList(),
      // …
  ]
})
```

You can overwrite every aspect of an existing extension. [Read more about that here.](/guide/custom-extensions/overwrite-defaults)

## Option 2: Extend existing extensions

## Option 3: Start from scratch
