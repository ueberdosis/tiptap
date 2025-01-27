---
'@tiptap/extension-text-style': minor
---

This adds several extensions to the `text-style` package, which can be used to style text in the editor.

## TextStyleKit

This extension adds a group of text style extensions to the editor, and is the recommended way of using the text style extensions. For easy configuration, you can pass an object with the following keys:

`backgroundColor`, `color`, `fontFamily`, `fontSize`, `lineHeight`, `textStyle`

Usage:

```ts
import { TextStyleKit } from '@tiptap/extension-text-style'


new Editor({
  extensions: [
    TextStyleKit.configure({
      backgroundColor: {
        types: ['textStyle'],
      },
      color: {
        types: ['textStyle'],
      },
      fontFamily: {
        types: ['textStyle'],
      },
      fontSize: {
        types: ['textStyle'],
      },
      lineHeight: {
        types: ['textStyle'],
      },
      textStyle: {
        types: ['textStyle'],
      },
    }),
  ],
})
```

## Want to use the extensions separately?

For more control, you can also use the extensions separately.

### BackgroundColor

This extension controls the background-color of a range of text in the editor.

Usage:

```ts
import { BackgroundColor } from '@tiptap/extension-text-style'
```

### Color

This extension controls the color of a range of text in the editor.

Migrate from `@tiptap/extension-color` to `@tiptap/extension-text-style`:

```diff
- import Color from '@tiptap/extension-color'
+ import { Color } from '@tiptap/extension-text-style'
```

Usage:

```ts
import { Color } from '@tiptap/extension-text-style'
```

### FontFamily

This extension controls the font-family of a range of text in the editor.

Migration from `@tiptap/extension-font-family` to `@tiptap/extension-text-style`:

```diff
- import FontFamily from '@tiptap/extension-font-family'
+ import { FontFamily } from '@tiptap/extension-text-style'
```

Usage:

```ts
import { FontFamily } from '@tiptap/extension-text-style'
```

### FontSize

This extension controls the font-size of a range of text in the editor.

```ts
import { FontSize } from '@tiptap/extension-text-style'
```

### LineHeight

This extension controls the line-height of a range of text in the editor.

```ts
import { LineHeight } from '@tiptap/extension-text-style'
```
